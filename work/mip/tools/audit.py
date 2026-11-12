"""
MIP source audit (read-only): inventory a mainframe repository and record every construct
on the POC checklist with its exact source path and original line number, at a pinned revision.

    python -I audit.py <repo> <out.json>

Only reads files listed by `git ls-files`. Never runs anything from the repository.
Fixed-format COBOL: columns 1-6 sequence, 7 indicator, 8-72 code; comment lines are skipped
but line numbers are always the original file's.
"""
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

repo, out = Path(sys.argv[1]), Path(sys.argv[2])
git = lambda *a: subprocess.run(["git", "-C", str(repo), *a], capture_output=True, text=True, check=True).stdout
revision = git("rev-parse", "HEAD").strip()
committed = git("log", "-1", "--format=%cI").strip()
files = git("ls-files").splitlines()

KIND = [
    ("cobol_program", r"\.(cbl|cob)$"),
    ("pli_program", r"\.pli$"),
    ("copybook", r"\.(cpy|copy)$"),
    ("bms_map", r"\.bms$"),
    ("ims_dbd", r"/ims/DBD/.*\.asm$"),
    ("ims_psb", r"/ims/PSB/.*\.asm$"),
    ("jcl", r"\.(jcl|prc|proc)$|\.jcl\.j2$|/jcl/.*\.j2$"),
    ("csd", r"\.csd$|/csd/"),
    ("assembler", r"\.(asm|mac)$"),
    ("java", r"\.java$"),
]


def kind_of(p):
    for k, rx in KIND:
        if re.search(rx, p, re.I):
            return k
    return None


inventory = defaultdict(list)
for p in files:
    k = kind_of(p)
    if k:
        inventory[k].append(p)


def read(p):
    return (repo / p).read_text(encoding="utf-8", errors="replace").splitlines()


def code(lines):
    """(original line number, code text cols 8-72) for non-comment lines."""
    for n, raw in enumerate(lines, 1):
        if len(raw) >= 7 and raw[6] in "*/":
            continue
        yield n, raw[7:72] if len(raw) > 7 else ""


def blocks(lines, opener):
    """EXEC ... END-EXEC blocks: (start line, end line, normalized text)."""
    out, cur, start = [], None, 0
    for n, text in code(lines):
        if cur is None:
            m = re.search(opener, text, re.I)
            if m:
                cur, start = [text[m.start():]], n
            else:
                continue
        else:
            cur.append(text)
        joined = " ".join(cur)
        if re.search(r"\bEND-EXEC\b", joined, re.I):
            out.append((start, n, re.sub(r"\s+", " ", joined[: re.search(r"\bEND-EXEC\b", joined, re.I).end()]).strip()))
            cur = None
            # a second EXEC on the same line
            rest = text[re.search(r"\bEND-EXEC\b", text, re.I).end():]
            m2 = re.search(opener, rest, re.I)
            if m2:
                cur, start = [rest[m2.start():]], n
    return out


def opt(text, name):
    m = re.search(rf"\b{name}\s*\(\s*('[^']*'|\"[^\"]*\"|[A-Z0-9][A-Z0-9-]*(?:\s+OF\s+[A-Z0-9-]+)?)\s*\)", text, re.I)
    return m.group(1).strip("'\"").upper() if m else None


def literal_values(lines, var):
    """Where a variable gets a literal: VALUE clauses and MOVE 'x' TO var (constant propagation, first level)."""
    found = []
    v = re.escape(var)
    for n, text in code(lines):
        m = re.search(rf"\b\d\d\s+{v}\b[^.]*\bVALUE\s+'([^']+)'", text, re.I)
        if m:
            found.append({"value": m.group(1).strip(), "line": n, "how": "VALUE"})
        for m in re.finditer(rf"\bMOVE\s+'([^']+)'\s+TO\s+(?:[A-Z0-9-]+\s+)*?{v}\b", text, re.I):
            found.append({"value": m.group(1).strip(), "line": n, "how": "MOVE"})
    return found


programs = {}
for p in inventory["cobol_program"]:
    lines = read(p)
    pid = next((m.group(1).upper() for _, t in code(lines) for m in [re.search(r"PROGRAM-ID\.\s*'?([A-Z0-9#@$-]+)", t, re.I)] if m), Path(p).stem.upper())
    rec = defaultdict(list)
    rec["path"], rec["lines"] = p, len(lines)
    in_proc = False
    in_exec = False
    for n, t in code(lines):
        if re.search(r"\bPROCEDURE\s+DIVISION\b", t, re.I):
            in_proc = True
        # Statements inside EXEC ... END-EXEC belong to CICS, SQL or DL/I, not COBOL (SQL's DELETE FROM is not a file DELETE).
        was_exec = in_exec
        if re.search(r"\bEXEC\s+(CICS|SQL|DLI)\b", t, re.I):
            in_exec = True
        inside = in_exec or was_exec
        if re.search(r"\bEND-EXEC\b", t, re.I):
            in_exec = False
        for m in re.finditer(r"\bCOPY\s+([A-Z0-9#@$-]+)(\s+REPLACING\b)?", t, re.I):
            rec["copy"].append({"copybook": m.group(1).upper(), "line": n, **({"replacing": True} if m.group(2) else {})})
        if re.search(r"^\s*REPLACE\b", t, re.I):
            rec["replace"].append({"line": n})
        for m in re.finditer(r"\b([A-Z0-9-]+)\s+REDEFINES\s+([A-Z0-9-]+)", t, re.I):
            rec["redefines"].append({"item": m.group(1).upper(), "redefines": m.group(2).upper(), "line": n})
        if re.search(r"\bOCCURS\s+\d+", t, re.I):
            rec["occurs"].append({"line": n, "text": t.strip()[:60]})
        m = re.search(r"\bSELECT\s+([A-Z0-9-]+)\s+ASSIGN\s+(?:TO\s+)?([A-Z0-9-]+)", t, re.I)
        if m:
            rec["file_select"].append({"file": m.group(1).upper(), "assign": m.group(2).upper(), "line": n})
        if re.search(r"ORGANIZATION\s+(IS\s+)?INDEXED", t, re.I):
            rec["vsam_indexed"].append({"line": n})
        if not in_proc:
            continue
        for m in re.finditer(r"\bCALL\s+('[^']+'|\"[^\"]+\"|[A-Z][A-Z0-9-]*)", t, re.I):
            target = m.group(1)
            if target.startswith(("'", '"')):
                rec["call_static"].append({"target": target.strip("'\"").upper(), "line": n})
            else:
                rec["call_dynamic"].append({"via": target.upper(), "line": n, "values": literal_values(lines, target)})
        m = re.search(r"\bPERFORM\s+([A-Z0-9][A-Z0-9-]*)(?:\s+(THRU|THROUGH)\s+([A-Z0-9-]+))?", t, re.I)
        if m and m.group(1).upper() not in ("UNTIL", "VARYING", "WITH", "TEST") and not re.match(r"\d+$", m.group(1)):
            rec["perform_thru" if m.group(2) else "perform"].append({"target": m.group(1).upper(), **({"thru": m.group(3).upper()} if m.group(2) else {}), "line": n})
        m = re.search(r"\bGO\s+TO\s+([A-Z0-9-]+)", t, re.I)
        if m:
            rec["go_to"].append({"target": m.group(1).upper(), "line": n})
        m = re.search(r"^\s*(READ|WRITE|REWRITE|DELETE|START)\s+([A-Z0-9-]+)", t, re.I)
        if m and not inside:
            rec["file_io"].append({"verb": m.group(1).upper(), "file": m.group(2).upper(), "line": n})
    for s, e, text in blocks(lines, r"\bEXEC\s+CICS\b"):
        cmd = re.match(r"EXEC\s+CICS\s+([A-Z]+(?:\s+[A-Z]+)?)", text, re.I).group(1).upper().split()
        verb = cmd[0]
        item = {"command": " ".join(cmd[:2]) if verb in ("RETURN", "SEND", "RECEIVE", "GET", "PUT", "START") else verb, "line": s, "end": e}
        for k in ("PROGRAM", "FILE", "DATASET", "TRANSID", "COMMAREA", "CHANNEL", "CONTAINER", "QUEUE", "MAP", "MAPSET"):
            v = opt(text, k)
            if v:
                item[k.lower()] = v
        if item.get("program") and not text.upper().split("PROGRAM", 1)[1].lstrip(" (").startswith("'"):
            item["program_dynamic"] = True
            item["program_values"] = literal_values(lines, item["program"])
        rec["cics"].append(item)
    for s, e, text in blocks(lines, r"\bEXEC\s+SQL\b"):
        tables = sorted({t.upper() for t in re.findall(r"\b(?:FROM|INTO|UPDATE|JOIN|TABLE)\s+([A-Z][A-Z0-9_.]*)", text, re.I) if not t.startswith((":",)) and t.upper() not in ("SQLCA",)})
        verb = re.match(r"EXEC\s+SQL\s+([A-Z]+)", text, re.I)
        rec["sql"].append({"verb": verb.group(1).upper() if verb else "?", "tables": tables, "line": s})
    for s, e, text in blocks(lines, r"\bEXEC\s+DLI\b"):
        rec["dli_exec"].append({"line": s, "text": text[:120]})
    for c in rec.get("call_static", []):
        if c["target"] in ("CBLTDLI", "AIBTDLI", "CEETDLI", "PLITDLI"):
            rec["dli_call"].append({"interface": c["target"], "line": c["line"]})
    programs[pid] = {k: v for k, v in rec.items()}

# JCL: jobs, steps, programs and procedures run, datasets
jcl = {}
for p in inventory["jcl"]:
    lines = read(p)
    rec = defaultdict(list)
    step = None
    for n, raw in enumerate(lines, 1):
        if raw.startswith("//*"):
            continue
        m = re.match(r"//([A-Z0-9#@$]+)\s+JOB\b", raw, re.I)
        if m:
            rec["job"].append({"name": m.group(1).upper(), "line": n})
        m = re.match(r"//([A-Z0-9#@$]*)\s+EXEC\s+(?:(PGM)=([A-Z0-9#@$]+)|(?:PROC=)?([A-Z0-9#@$]+))", raw, re.I)
        if m:
            step = m.group(1).upper() or None
            rec["exec"].append({"step": step, **({"program": m.group(3).upper()} if m.group(2) else {"proc": m.group(4).upper()}), "line": n})
        m = re.match(r"//([A-Z0-9#@$]*)\s+DD\b.*\bDSN=([A-Z0-9#@$.(){}+-]+)", raw, re.I)
        if m:
            rec["dd"].append({"step": step, "dd": m.group(1).upper() or None, "dsn": m.group(2).upper(), "line": n})
        if re.match(r"//[A-Z0-9#@$]+\s+PROC\b", raw, re.I):
            rec["proc"].append({"line": n})
        # TSO batch (IKJEFT01) runs the real program from in-line control statements: DSN ... RUN PROGRAM(x).
        m = re.search(r"^\s*RUN\s+PROGRAM\s*\(\s*([A-Z0-9#@$]+)\s*\)", raw, re.I)
        if m:
            rec["runs_via_dsn"].append({"step": step, "program": m.group(1).upper(), "line": n})
    jcl[p] = dict(rec)

summary = {
    "corpus": "IBM/Bank-of-Z",
    "url": "https://github.com/IBM/Bank-of-Z",
    "revision": revision,
    "committed": committed,
    "inventory": {k: sorted(v) for k, v in inventory.items()},
    "counts": {k: len(v) for k, v in inventory.items()},
    "programs": programs,
    "jcl": jcl,
}
out.write_text(json.dumps(summary, indent=1), encoding="utf-8")
tot = lambda key: sum(len(p.get(key, [])) for p in programs.values())
print(f"revision {revision[:12]} ({committed})")
print("inventory:", {k: len(v) for k, v in inventory.items()})
for key in ("call_static", "call_dynamic", "perform", "perform_thru", "go_to", "copy", "replace", "redefines", "occurs", "file_select", "vsam_indexed", "file_io", "cics", "sql", "dli_call", "dli_exec"):
    print(f"  {key:13s} {tot(key):5d}  in {sum(1 for p in programs.values() if p.get(key))} programs")
cics = defaultdict(int)
for p in programs.values():
    for c in p.get("cics", []):
        cics[c["command"]] += 1
print("  cics commands:", dict(sorted(cics.items(), key=lambda kv: -kv[1])))
print("  jcl exec:", sum(len(j.get("exec", [])) for j in jcl.values()), "dd with DSN:", sum(len(j.get("dd", [])) for j in jcl.values()))
