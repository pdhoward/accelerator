"""
Build the MIP golden expected-results manifest for IBM Bank of Z (mip.md §5–§7).

    python -I manifest.py <bank-of-z repo> <audit.json> <out.json>

Two kinds of content:
  - mechanical: the subset's program-to-program edges, SQL tables and batch steps, from audit.py's
    read of the source (every item carries file and line);
  - hand-verified: three cross-program business rules and the golden trace, written here from a
    reading of the source on 2026-11-12. Every evidence line below is checked against the file at
    the pinned revision: if the line doesn't contain the expected text, this script fails, so the
    manifest can never drift from the source silently.
"""
import json
import subprocess
import sys
from pathlib import Path

repo, audit_path, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
REVISION = "568421969f860beffdcbd4451009d6956e3ecfce"
head = subprocess.run(["git", "-C", str(repo), "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
assert head == REVISION, f"the corpus is at {head}, the manifest is pinned to {REVISION}"
audit = json.loads(audit_path.read_text())
P = audit["programs"]

CICS = "src/base/cics/cobol/"
COPY = "src/base/cics/copy/"
JCL = "src/base/batch/jcl/"


def ev(path, line, must, note=None):
    """One piece of evidence: the line's text, verified to contain `must`."""
    text = (repo / path).read_text(encoding="utf-8", errors="replace").splitlines()[line - 1]
    assert must.upper() in text.upper(), f"{path}:{line} does not contain {must!r}: {text.strip()!r}"
    return {"file": path, "line": line, "text": text[6:72].rstrip() if len(text) > 6 and path.endswith((".cbl", ".cpy")) else text.rstrip(), **({"note": note} if note else {})}


# ── The connected subset (mip.md §4) ────────────────────────────────────────
SUBSET = {
    "BNKMENU": "online menu: routes to every function by RETURN TRANSID",
    "BNK1CRA": "online: credit or debit an account (teller screen)",
    "DBCRFUN": "service: apply a credit or debit to an account (DB2)",
    "BNK1TFN": "online: transfer between accounts",
    "XFRFUN": "service: transfer funds (DB2)",
    "BNK1CAC": "online: create an account",
    "CREACC": "service: create an account (DB2, named counter)",
    "INQCUST": "service: read a customer (DB2)",
    "INQACCCU": "service: list a customer's accounts (DB2 cursor)",
    "BNK1CCS": "online: create a customer",
    "CRECUST": "service: create a customer, with an asynchronous credit check",
    "CRDTAGY1": "credit agency 1 (dummy: random delay and score)",
    "CRDTAGY2": "credit agency 2",
    "CRDTAGY3": "credit agency 3",
    "CRDTAGY4": "credit agency 4",
    "CRDTAGY5": "credit agency 5",
    "BNK1DCS": "online: display, update or delete a customer",
    "DELCUS": "service: delete a customer and all their accounts",
    "DELACC": "service: delete an account",
    "ABNDPROC": "abend handler: writes ABNDFILE (a CICS file)",
}
programs = [{"id": pid, "path": P[pid]["path"], "lines": P[pid]["lines"], "role": role} for pid, role in SUBSET.items()]

# ── Mechanical expectations from the audit ─────────────────────────────────
edges, sql, copies = [], [], []
for pid in SUBSET:
    p = P[pid]
    for c in p.get("cics", []):
        if c["command"] in ("LINK", "XCTL") and c.get("program"):
            e = {"from": pid, "kind": c["command"].lower(), "file": p["path"], "line": c["line"]}
            if c.get("program_dynamic"):
                values = c.get("program_values", [])
                e |= {"to": values[0]["value"] if len(values) == 1 else None, "dynamic": {"via": c["program"], "resolved_by": values}}
            else:
                e["to"] = c["program"].strip()
            edges.append(e)
        elif c["command"] == "RETURN TRANSID":
            edges.append({"from": pid, "kind": "return_transid", "to_transid": c.get("transid"), "file": p["path"], "line": c["line"]})
        elif c["command"] == "RUN":
            edges.append({"from": pid, "kind": "run_async", "to_transid": None, "dynamic": {"via": c.get("transid")}, "file": p["path"], "line": c["line"]})
        elif c["command"] in ("READ", "WRITE", "REWRITE", "DELETE"):
            edges.append({"from": pid, "kind": f"cics_file_{c['command'].lower()}", "to_file": c.get("file") or c.get("dataset"), "file": p["path"], "line": c["line"]})
    for c in p.get("call_static", []):
        edges.append({"from": pid, "kind": "call", "to": c["target"], "file": p["path"], "line": c["line"]})
    # A FETCH reads the tables of the cursor it names, declared in the same program (the audit's pattern
    # would read "FETCH FROM ACC-CURSOR" as table ACC: corrected 2026-11-12, found by MIP's first run).
    declared = [s["tables"] for s in p.get("sql", []) if s["verb"] == "DECLARE"]
    for s in p.get("sql", []):
        if s["verb"] in ("SELECT", "INSERT", "UPDATE", "DELETE", "DECLARE", "FETCH"):
            tables = sorted({t for d in declared for t in d}) if s["verb"] == "FETCH" and len(declared) == 1 else s["tables"]
            sql.append({"program": pid, "verb": s["verb"], "tables": tables, "file": p["path"], "line": s["line"]})
    for c in p.get("copy", []):
        copies.append({"program": pid, "copybook": c["copybook"], "line": c["line"], **({"replacing": True} if c.get("replacing") else {})})

batch = [
    {"job_file": f, "step": r["step"], "program": r["program"], "line": r["line"], "via": "IKJEFT01 → DSN RUN PROGRAM (in-line SYSTSIN)"}
    for f, j in audit["jcl"].items() if f.startswith(JCL) for r in j.get("runs_via_dsn", [])
]

# ── Hand-verified: what static analysis must NOT claim ─────────────────────
unresolved = [
    {
        "what": "CRECUST RUN TRANSID(WS-RUN-TRANSID) → which programs run",
        "values": ["OCR1", "OCR2", "OCR3", "OCR4", "OCR5"],
        "values_evidence": [ev(CICS + "CRECUST.cbl", 620, "PERFORM VARYING WS-CC-CNT FROM 1"), ev(CICS + "CRECUST.cbl", 626, "STRING 'OCR'"), ev(CICS + "CRECUST.cbl", 687, "RUN TRANSID(WS-RUN-TRANSID)")],
        "why": "The transaction IDs are computed in a loop (expected: OCR1–OCR5, by constant evaluation). Which program each transaction runs is a CICS resource definition (CSD), which is not in the repository. The pairing OCRn → CRDTAGYn is suggested by the names only and must be reported as unresolved, not asserted.",
    },
    {
        "what": "BNK1CRA → DBCRFUN: COMM-FACILTYPE = 496",
        "evidence": [ev(CICS + "BNK1CRA.cbl", 508, "ODFACILTYPE(SUBPGM-FACILTYPE)"), ev(CICS + "DBCRFUN.cbl", 344, "COMM-FACILTYPE = 496")],
        "why": "The facility type is set at run time by EXEC CICS INQUIRE ASSOCIATION, so whether the debit checks apply to a given request can't be decided from source. The program's own comment (DBCRFUN, 'COMM-FACILTYPE(496 = NONE)') is documentation, not a proven value.",
    },
    {
        "what": "ABNDPROC WRITE FILE(ABNDFILE): the file's organization",
        "evidence": [ev(CICS + "ABNDPROC.cbl", 141, "EXEC CICS WRITE")],
        "why": "A CICS file; whether it is a VSAM KSDS is defined in the CSD and the dataset definitions, not in the repository.",
    },
    {
        "what": "IBTRAN CALL <data name> (FINDCLASS, GETSTATICMETHODID, …)",
        "why": "Calls through procedure pointers to the Java Native Interface (COBOL–Java interop), not COBOL programs. They must be classified as JNI calls, not resolved or reported as missing programs.",
    },
]

# ── Hand-verified business rules (mip.md §5) ───────────────────────────────
rules = [
    {
        "id": "BOZ-R1",
        "title": "A teller debit is refused when it would take the available balance below zero (the overdraft limit is read but not applied)",
        "programs": ["BNK1CRA", "DBCRFUN"],
        "input": [ev(CICS + "BNK1CRA.cbl", 494, "IF SIGNI = '-'", "a '-' sign on the screen makes the amount a debit"), ev(CICS + "BNK1CRA.cbl", 498, "MOVE WS-AMOUNT-AS-FLOAT TO SUBPGM-AMT")],
        "decision": [
            ev(CICS + "DBCRFUN.cbl", 245, "EXEC SQL", "reads the account row, including AVAILABLE_BALANCE and OVERDRAFT_LIMIT"),
            ev(CICS + "DBCRFUN.cbl", 341, "COMPUTE WS-DIFFERENCE = HV-ACCOUNT-AVAIL-BAL"),
            ev(CICS + "DBCRFUN.cbl", 344, "IF WS-DIFFERENCE < 0 AND COMM-FACILTYPE = 496"),
            ev(CICS + "DBCRFUN.cbl", 347, "MOVE '3' TO COMM-FAIL-CODE"),
        ],
        "outcome": [ev(CICS + "BNK1CRA.cbl", 604, "WHEN '3'"), ev(CICS + "BNK1CRA.cbl", 606, "Sorry insufficient funds available")],
        "condition": {"field": "ACCOUNT_AVAILABLE_BALANCE + COMM-AMT", "operator": "<", "value": 0, "and": "COMM-FACILTYPE = 496 (set at run time)"},
        "also": "Related: a payment out of a MORTGAGE or LOAN account sets fail code 4 (DBCRFUN 330–335), which BNK1CRA has no message for (it falls to WHEN OTHER, 'the AMOUNT could not be applied').",
        "also_evidence": [ev(CICS + "DBCRFUN.cbl", 330, "HV-ACCOUNT-ACC-TYPE = 'MORTGAGE'"), ev(CICS + "DBCRFUN.cbl", 335, "MOVE '4' TO COMM-FAIL-CODE"), ev(CICS + "BNK1CRA.cbl", 612, "WHEN OTHER")],
    },
    {
        "id": "BOZ-R2",
        "title": "A customer may hold at most ten accounts: an eleventh is refused",
        "programs": ["BNK1CAC", "CREACC", "INQCUST", "INQACCCU"],
        "input": [ev(CICS + "BNK1CAC.cbl", 775, "EXEC CICS LINK", "the create-account screen links to CREACC")],
        "decision": [
            ev(CICS + "CREACC.cbl", 327, "EXEC CICS LINK", "the customer must exist (INQCUST); otherwise fail code 1"),
            ev(CICS + "CREACC.cbl", 1182, "EXEC CICS LINK", "the customer's accounts are listed by INQACCCU"),
            ev(CICS + "INQACCCU.cbl", 464, "NUMBER-OF-ACCOUNTS = 20", "INQACCCU fetches at most 20 accounts"),
            ev(CICS + "CREACC.cbl", 380, "IF NUMBER-OF-ACCOUNTS IN INQACCCU-COMMAREA > 9"),
            ev(CICS + "CREACC.cbl", 383, "MOVE '8' TO COMM-FAIL-CODE"),
        ],
        "outcome": [ev(CICS + "BNK1CAC.cbl", 897, "WHEN '8'"), ev(CICS + "BNK1CAC.cbl", 900, "too many accounts")],
        "condition": {"field": "NUMBER-OF-ACCOUNTS (from INQACCCU)", "operator": ">", "value": 9},
        "also": "The same program refuses account types other than ISA, MORTGAGE, SAVING, CURRENT and LOAN (ACCOUNT-TYPE-CHECK, CREACC 1303 onward).",
        "also_evidence": [ev(CICS + "CREACC.cbl", 1303, "ACCOUNT-TYPE-CHECK SECTION")],
    },
    {
        "id": "BOZ-R3",
        "title": "A new customer's credit score is the average of the agency scores that arrive in time, and 0 if none do",
        "programs": ["BNK1CCS", "CRECUST", "CRDTAGY1", "CRDTAGY2", "CRDTAGY3", "CRDTAGY4", "CRDTAGY5"],
        "input": [ev(CICS + "BNK1CCS.cbl", 997, "EXEC CICS LINK", "the create-customer screen links to CRECUST")],
        "decision": [
            ev(CICS + "CRECUST.cbl", 687, "RUN TRANSID(WS-RUN-TRANSID)", "five asynchronous requests (OCR1–OCR5)"),
            ev(CICS + "CRDTAGY1.cbl", 201, "COMPUTE WS-NEW-CREDSCORE", "each agency returns a score from 1 to 999 (random in this sample)"),
            ev(CICS + "CRECUST.cbl", 749, "FETCH ANY", "collects whichever replies have arrived"),
            ev(CICS + "CRECUST.cbl", 774, "IF WS-RETRIEVED-CNT = 0"),
            ev(CICS + "CRECUST.cbl", 776, "MOVE 0 TO COMM-CREDIT-SCORE"),
            ev(CICS + "CRECUST.cbl", 812, "COMPUTE WS-ACTUAL-CS-SCR = WS-TOTAL-CS-SCR /"),
        ],
        "outcome": [ev(CICS + "CRECUST.cbl", 1219, "EXEC SQL", "the customer row is inserted with the score"), ev(CICS + "BNK1CCS.cbl", 1109, "MOVE SUBPGM-CREDIT-SCORE   TO CREDSCO", "and shown on the screen")],
        "condition": {"score": "sum of received scores / number received", "fallback": "0 when no agency replies in time"},
        "note": "The agencies are deliberately dummies (random delay 0–3 s, random score). The rule worth extracting is the aggregation and its fallbacks, not the agencies' scores.",
    },
]

# ── The golden trace (mip.md §6) ───────────────────────────────────────────
golden = {
    "rule": "BOZ-R1",
    "question": "When a teller debits an account, what decides whether it is refused, and what does the teller see?",
    "steps": [
        {"step": 1, "what": "The teller enters an account number and an amount with a sign on the BNK1CRA screen; '-' makes it a debit", "evidence": [ev(CICS + "BNK1CRA.cbl", 494, "IF SIGNI = '-'"), ev(CICS + "BNK1CRA.cbl", 498, "MOVE WS-AMOUNT-AS-FLOAT TO SUBPGM-AMT")]},
        {"step": 2, "what": "BNK1CRA asks CICS where the request came from (facility type, at run time)", "evidence": [ev(CICS + "BNK1CRA.cbl", 503, "EXEC CICS INQUIRE ASSOCIATION"), ev(CICS + "BNK1CRA.cbl", 508, "ODFACILTYPE(SUBPGM-FACILTYPE)")]},
        {"step": 3, "what": "BNK1CRA links to DBCRFUN with its own layout of the parameters (SUBPGM-PARMS, 92 bytes)", "evidence": [ev(CICS + "BNK1CRA.cbl", 511, "EXEC CICS LINK"), ev(CICS + "BNK1CRA.cbl", 512, "PROGRAM('DBCRFUN')"), ev(CICS + "BNK1CRA.cbl", 513, "COMMAREA(SUBPGM-PARMS)")]},
        {"step": 4, "what": "DBCRFUN receives them through the PAYDBCR copybook (132 bytes)", "evidence": [ev(CICS + "DBCRFUN.cbl", 195, "COPY PAYDBCR")]},
        {"step": 5, "what": "DBCRFUN reads the account's balances and limits from DB2", "evidence": [ev(CICS + "DBCRFUN.cbl", 245, "EXEC SQL"), ev(CICS + "DBCRFUN.cbl", 270, "FROM ACCOUNT")]},
        {"step": 6, "what": "A debit (amount below zero) from a MORTGAGE or LOAN account is refused with code 4", "evidence": [ev(CICS + "DBCRFUN.cbl", 307, "IF COMM-AMT < 0"), ev(CICS + "DBCRFUN.cbl", 335, "MOVE '4' TO COMM-FAIL-CODE")]},
        {"step": 7, "what": "Otherwise, if the available balance plus the (negative) amount is below zero, it is refused with code 3; the overdraft limit is not used", "evidence": [ev(CICS + "DBCRFUN.cbl", 341, "COMPUTE WS-DIFFERENCE"), ev(CICS + "DBCRFUN.cbl", 344, "IF WS-DIFFERENCE < 0 AND COMM-FACILTYPE = 496"), ev(CICS + "DBCRFUN.cbl", 347, "MOVE '3' TO COMM-FAIL-CODE")]},
        {"step": 8, "what": "On success DBCRFUN updates the balances and records the transaction in PROCTRAN", "evidence": [ev(CICS + "DBCRFUN.cbl", 384, "COMPUTE HV-ACCOUNT-AVAIL-BAL"), ev(CICS + "DBCRFUN.cbl", 392, "EXEC SQL"), ev(CICS + "DBCRFUN.cbl", 441, "PERFORM WRITE-TO-PROCTRAN")]},
        {"step": 9, "what": "BNK1CRA reads the outcome and shows the teller a message", "evidence": [ev(CICS + "BNK1CRA.cbl", 581, "IF SUBPGM-SUCCESS = 'N'"), ev(CICS + "BNK1CRA.cbl", 606, "Sorry insufficient funds available"), ev(CICS + "BNK1CRA.cbl", 624, "Amount successfully applied")]},
    ],
    "lineage": [
        "screen AMTI + SIGNI → BNK1CRA.WS-AMOUNT-AS-FLOAT → BNK1CRA.SUBPGM-AMT (offset 8, 12 bytes)",
        "→ COMMAREA → DBCRFUN.COMM-AMT (PAYDBCR, offset 8, 12 bytes)",
        "DB2 ACCOUNT.ACCOUNT_AVAILABLE_BALANCE → DBCRFUN.HV-ACCOUNT-AVAIL-BAL",
        "HV-ACCOUNT-AVAIL-BAL + COMM-AMT → DBCRFUN.WS-DIFFERENCE → decision (< 0) → COMM-FAIL-CODE '3'",
        "DBCRFUN.COMM-SUCCESS / COMM-FAIL-CODE (offsets 130, 131) → BNK1CRA.SUBPGM-SUCCESS / SUBPGM-FAIL-CODE (offsets 90, 91): see the finding",
    ],
    "finding": {
        "title": "Interface drift: BNK1CRA's copy of the DBCRFUN parameters is 40 bytes short (predicted defect)",
        "evidence": [
            ev(COPY + "PAYDBCR.cpy", 19, "COMM-DESCRIPTION      PIC X(40)"),
            ev(COPY + "PAYDBCR.cpy", 20, "COMM-SUCCESS"),
            ev(CICS + "BNK1CRA.cbl", 132, "FILLER"),
            ev(CICS + "BNK1CRA.cbl", 133, "SUBPGM-SUCCESS"),
        ],
        "history": "Commit afb4f68 (2026-07-23, 'CICS Account transaction history (#123)') added COMM-DESCRIPTION to PAYDBCR and updated DBCRFUN, XFRFUN, the API mappings and the Java caller; BNK1CRA, which declares the parameters inline instead of copying PAYDBCR, was not updated.",
        "offsets": {"PAYDBCR": {"COMM-DESCRIPTION": [90, 129], "COMM-SUCCESS": 130, "COMM-FAIL-CODE": 131, "length": 132}, "BNK1CRA": {"SUBPGM-SUCCESS": 90, "SUBPGM-FAIL-CODE": 91, "length": 92}},
        "predicted_effect": "BNK1CRA passes 92 bytes; DBCRFUN addresses 132. DBCRFUN's success flag and fail code land past the end of BNK1CRA's parameter area, and BNK1CRA reads its flag from the bytes DBCRFUN treats as the start of the description. A refused debit would therefore likely be reported to the teller as 'Amount successfully applied' while the balance is unchanged. Static analysis only: to be confirmed on a running CICS system.",
    },
}

absent = [
    {"feature": "CICS XCTL", "found": 0, "note": "every transfer of control is LINK (145) or RETURN TRANSID (26)"},
    {"feature": "VSAM KSDS declared in COBOL (ORGANIZATION INDEXED)", "found": 0, "note": "data is in DB2 (143 EXEC SQL) and IMS (31 CBLTDLI calls); one CICS WRITE FILE(ABNDFILE), organization not in the repository"},
    {"feature": "EXEC DLI", "found": 0, "note": "IMS is reached through CALL 'CBLTDLI' only"},
    {"feature": "REPLACE (compiler directive)", "found": 0, "note": "COPY ... REPLACING is present (7 programs)"},
    {"feature": "JCL procedures (PROC) and EXEC PGM= of application programs", "found": 0, "note": "batch programs run through IKJEFT01 → DSN RUN PROGRAM"},
    {"feature": "CICS resource definitions (CSD)", "found": 0, "note": "transaction → program and file definitions are not in the repository"},
]

# ── P2: resolution and interfaces, hand-verified 2026-11-12 ─────────────────
p2 = {
    "resolved": [
        {"program": "CRECUST", "kind": "run_async", "line": 687, "values": ["OCR1", "OCR2", "OCR3", "OCR4", "OCR5"],
         "evidence": [ev(CICS + "CRECUST.cbl", 231, "WS-CC-CNT"), ev(CICS + "CRECUST.cbl", 620, "PERFORM VARYING WS-CC-CNT FROM 1"), ev(CICS + "CRECUST.cbl", 621, "UNTIL WS-CC-CNT > 5"), ev(CICS + "CRECUST.cbl", 626, "STRING 'OCR'")]},
    ],
    "interfaces": [
        {"caller": "BNK1CRA", "callee": "DBCRFUN", "line": 511, "verdict": "differs", "severity": "high", "caller_size": 92, "callee_size": 132,
         "why": "DBCRFUN uses COMM-DESCRIPTION (90–129), COMM-SUCCESS (130) and COMM-FAIL-CODE (131); BNK1CRA passes 92 bytes with its success flag at 90",
         "evidence": [ev(CICS + "BNK1CRA.cbl", 133, "SUBPGM-SUCCESS"), ev(COPY + "PAYDBCR.cpy", 19, "COMM-DESCRIPTION"), ev(COPY + "PAYDBCR.cpy", 20, "COMM-SUCCESS"), ev(COPY + "PAYDBCR.cpy", 21, "COMM-FAIL-CODE")]},
        {"caller": "DELCUS", "callee": "DELACC", "line": 378, "verdict": "differs", "severity": "low", "caller_size": 118, "callee_size": 122,
         "why": "DELCUS declares its own copy of the parameters with two PCB pointers; DELACC's copybook has three. DELACC never mentions DELACC-DEL-PCB3, so nothing reads the missing bytes today",
         "evidence": [ev(CICS + "DELCUS.cbl", 244, "DELACC-COMM-PCB1"), ev(CICS + "DELCUS.cbl", 245, "DELACC-COMM-PCB2"), ev(COPY + "DELACC.cpy", 39, "DELACC-DEL-PCB3")]},
    ],
    "not_findings": [
        {"caller": "BNK1UAC", "callee": "UPDACC", "line": 954, "verdict": "compatible", "why": "BNK1UAC passes 4 more bytes (COMM-PCB1-POINTER) than UPDACC reads; every field UPDACC reads lines up",
         "evidence": [ev(CICS + "BNK1UAC.cbl", 193, "COMM-PCB1-POINTER")]},
        {"caller": "BNK1DAC", "callee": "DELACC", "line": 713, "verdict": "same", "why": "PARMS-SUBPGM matches DELACC's 122 bytes; the COPY INQACC that follows it opens a record of its own",
         "evidence": [ev(CICS + "BNK1DAC.cbl", 83, "01 PARMS-SUBPGM"), ev(CICS + "BNK1DAC.cbl", 104, "PARMS-SUBPGM-DEL-PCB3"), ev(CICS + "BNK1DAC.cbl", 106, "COPY INQACC")]},
    ],
}

manifest = {
    "schema": "mip-expected/1",
    "p2": p2,
    "corpus": {"name": "IBM Bank of Z", "url": "https://github.com/IBM/Bank-of-Z", "license": "Apache-2.0", "revision": REVISION, "committed": audit["committed"]},
    "inventory": audit["counts"],
    "subset": programs,
    "expected": {"edges": edges, "sql": sql, "copybooks": copies, "batch": batch, "unresolved": unresolved},
    "rules": rules,
    "golden_trace": golden,
    "absent_features": absent,
}
out.write_text(json.dumps(manifest, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"ok: {len(programs)} programs · {len(edges)} edges · {len(sql)} SQL · {len(copies)} COPY · {len(batch)} batch steps · {len(rules)} rules · golden trace {len(golden['steps'])} steps · {sum(len(s['evidence']) for s in golden['steps'])} verified lines")
