"""
Evaluate cobol-py 0.2.1 on CardDemo (read-only): does every program parse, how fast,
and does its semantic graph find what an independent scan of the source finds?

Run with the isolated venv:  venv/Scripts/python eval_cobolpy.py <carddemo dir> <out.json>
Nothing in the estate is executed; files are only read.
"""
import json
import re
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

from cobol_py import CobolParserRunner, CobolParserParams, CobolSourceFormatEnum

repo = Path(sys.argv[1])
out = Path(sys.argv[2])
tracked = subprocess.run(["git", "-C", str(repo), "ls-files"], capture_output=True, text=True, check=True).stdout.splitlines()
programs = sorted(p for p in tracked if re.search(r"\.(cbl|cob)$", p, re.I))
copybooks = [repo / p for p in tracked if re.search(r"\.(cpy|copy)$", p, re.I)]
index = {}
for c in copybooks:
    index.setdefault(c.name.lower(), c)
    index.setdefault(c.stem.lower(), c)


def code_lines(text):
    """The source's real code (fixed format): columns 8-72, comment and debug lines dropped."""
    for raw in text.splitlines():
        line = raw.rstrip("\n").ljust(7)
        if line[6:7] in ("*", "/", "D", "d"):
            continue
        yield line[7:72]


def scan(text):
    """An independent count from the original source, to check the parser against."""
    body = "\n".join(code_lines(text))
    proc = body[re.search(r"PROCEDURE\s+DIVISION", body, re.I).end():] if re.search(r"PROCEDURE\s+DIVISION", body, re.I) else ""
    paragraphs = [m.group(1) for m in re.finditer(r"(?m)^ {0,3}([A-Z0-9][A-Z0-9-]*)\s*\.\s*$", proc, re.I) if not re.match(r"(EXIT|GOBACK|END-[A-Z-]+)$", m.group(1), re.I)]
    calls = re.findall(r"\bCALL\s+('[^']+'|\"[^\"]+\"|[A-Z][A-Z0-9-]*)", proc, re.I)
    cics = re.findall(r"EXEC\s+CICS\s+([A-Z]+)", proc, re.I)
    xctl_link = re.findall(r"EXEC\s+CICS\s+(XCTL|LINK)\b[^.]*?PROGRAM\s*\(\s*('[^']+'|[A-Z][A-Z0-9-]*)\s*\)", proc, re.I | re.S)
    return {
        "paragraphs": len(paragraphs),
        "performs": len(re.findall(r"\bPERFORM\b", proc, re.I)),
        "thru": len(re.findall(r"\bPERFORM\s+[A-Z0-9-]+\s+(THRU|THROUGH)\b", proc, re.I)),
        "calls": [c.upper() for c in calls],
        "exec_cics": len(cics),
        "xctl_link": [(k.upper(), t.upper()) for k, t in xctl_link],
        "exec_sql": len(re.findall(r"EXEC\s+SQL\b", proc, re.I)),
        "exec_dli": len(re.findall(r"EXEC\s+DLI\b", proc, re.I)),
        "redefines": len(re.findall(r"\bREDEFINES\b", body, re.I)),
    }


results = []
for rel in programs:
    path = repo / rel
    text = path.read_text(encoding="latin-1")
    expect = scan(text)
    params = CobolParserParams(format=CobolSourceFormatEnum.FIXED)
    params.charset = "latin-1"
    params.copy_book_files = copybooks
    params.copybook_name_index = index
    params.ignore_missing_copy = True
    t0 = time.perf_counter()
    rec = {"program": rel, "lines": text.count("\n") + 1, "expect": expect}
    try:
        program = CobolParserRunner().analyze(text, params, path.stem.upper())
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        kinds = Counter(type(e).__name__ for e in program.registry._elements.values())
        rec["asg"] = dict(kinds.most_common())
        found = {"paragraphs": kinds.get("Paragraph", 0), "performs": kinds.get("PerformStatement", 0), "exec_cics": kinds.get("ExecCicsStatement", 0), "exec_sql": kinds.get("ExecSqlStatement", 0)}
        calls = []
        for e in program.registry._elements.values():
            if type(e).__name__ == "CallStatement":
                calls.append(re.sub(r"\s+", " ", e.ctx.getText())[:60])
        found["calls"] = calls
        rec["found"] = found
        rec["ok"] = True
    except Exception as err:  # noqa: BLE001 - we record every failure
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        rec["ok"] = False
        rec["error"] = f"{type(err).__name__}: {str(err)[:300]}"
    results.append(rec)
    status = "ok " if rec["ok"] else "ERR"
    print(f"{status} {rec['seconds']:6.2f}s {rec['lines']:5d} lines  {rel}", flush=True)

out.write_text(json.dumps(results, indent=1))
ok = [r for r in results if r["ok"]]
print(f"\nparsed {len(ok)}/{len(results)} programs · {sum(r['lines'] for r in results)} lines · {sum(r['seconds'] for r in results):.1f}s total")
