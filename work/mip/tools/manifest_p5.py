"""
P5 golden lineage for CardDemo (mip.md §9, P5): the interest rate followed through the batch cycle.
Every evidence line is asserted against the source before it is written, so the golden file can't drift
from the code. Writes the "p5" section of carddemo.expected.json.

    python manifest_p5.py <carddemo root> <carddemo.expected.json>
"""
import json
import sys
from pathlib import Path

APP = "app"

# (step, file, line, text that must appear on the line, what happens)
STEPS = [
    ("origin", "jcl/DISCGRP.jcl", 61, "REPRO INFILE(DISCGRP) OUTFILE(DISCVSAM)", "The rate table is loaded from DISCGRP.PS into the DISCGRP VSAM file"),
    ("origin", "jcl/INTCALC.jcl", 35, "//DISCGRP  DD", "The interest job reads the rate table through DD DISCGRP"),
    ("origin", "cbl/CBACT04C.cbl", 416, "READ DISCGRP-FILE INTO DIS-GROUP-RECORD", "CBACT04C reads the rate record; the rate is DIS-INT-RATE, PIC S9(04)V99"),
    ("decides", "cbl/CBACT04C.cbl", 214, "IF DIS-INT-RATE NOT = 0", "Interest is computed only when the rate isn't zero"),
    ("derived", "cbl/CBACT04C.cbl", 464, "COMPUTE WS-MONTHLY-INT", "The rate becomes an amount: balance × rate ÷ 1200 (a percentage rate becomes money; no ROUNDED)"),
    ("derived", "cbl/CBACT04C.cbl", 467, "ADD WS-MONTHLY-INT  TO WS-TOTAL-INT", "Monthly interest is summed per account"),
    ("derived", "cbl/CBACT04C.cbl", 352, "ADD WS-TOTAL-INT  TO ACCT-CURR-BAL", "The total interest is added to the account balance"),
    ("file", "cbl/CBACT04C.cbl", 356, "REWRITE FD-ACCTFILE-REC FROM  ACCOUNT-RECORD", "The balance goes back to the account file"),
    ("renamed", "cbl/CBACT04C.cbl", 490, "MOVE WS-MONTHLY-INT       TO TRAN-AMT", "The interest is renamed TRAN-AMT, the amount of a new transaction"),
    ("file", "cbl/CBACT04C.cbl", 500, "WRITE FD-TRANFILE-REC FROM TRAN-RECORD", "The interest transaction is written to DD TRANSACT"),
    ("file", "jcl/INTCALC.jcl", 37, "//TRANSACT DD", "DD TRANSACT is a new generation of SYSTRAN, SYSTRAN(+1)"),
    ("dataset", "jcl/COMBTRAN.jcl", 25, "DD DISP=SHR", "COMBTRAN sorts SYSTRAN(0) together with the transaction backup (a concatenated SORTIN)"),
    ("dataset", "jcl/COMBTRAN.jcl", 33, "//SORTOUT  DD", "into TRANSACT.COMBINED(+1)"),
    ("dataset", "jcl/COMBTRAN.jcl", 48, "REPRO INFILE(TRANSACT) OUTFILE(TRANVSAM)", "which is loaded into the transaction file, TRANSACT.VSAM.KSDS"),
    ("dataset", "jcl/CREASTMT.JCL", 45, "TRANSACT.VSAM.KSDS", "The statement job sorts the transaction file"),
    ("reformatted", "jcl/CREASTMT.JCL", 54, "OUTREC FIELDS=(1:263,16,17:1,262,279:279,50)", "The sort moves the card number to the front: the amount moves from byte 133 to byte 149"),
    ("dataset", "jcl/CREASTMT.JCL", 61, "REPRO INFILE(INFILE) OUTFILE(OUTFILE)", "The sorted file is loaded into TRXFL.VSAM.KSDS"),
    ("dataset", "jcl/CREASTMT.JCL", 83, "//TRNXFILE DD", "CBSTM03A's step reads it through DD TRNXFILE"),
    ("file", "cbl/CBSTM03B.CBL", 141, "READ TRNX-FILE INTO LK-M03B-FLDT", "CBSTM03B, called by CBSTM03A, reads the record into its parameter"),
    ("renamed", "cbl/CBSTM03A.CBL", 839, "MOVE WS-M03B-FLDT TO TRNX-RECORD", "Back in CBSTM03A through CALL USING, the record lands in TRNX-RECORD: the amount is now TRNX-AMT"),
    ("renamed", "cbl/CBSTM03A.CBL", 829, "MOVE TRNX-REST TO WS-TRAN-REST", "It waits in a table, inside an untyped X(318) group"),
    ("renamed", "cbl/CBSTM03A.CBL", 426, "MOVE WS-TRAN-REST (CR-JMP, TR-JMP)", "and comes back out as TRNX-AMT"),
    ("derived", "cbl/CBSTM03A.CBL", 429, "ADD TRNX-AMT TO WS-TOTAL-AMT", "It is added to the statement total"),
    ("definition", "cbl/CBSTM03A.CBL", 678, "MOVE TRNX-AMT TO ST-TRANAMT", "It is printed on the statement: a signed number becomes edited text, PIC Z(9).99-"),
]

# The definition changes a reader must flag along the way.
CHANGES = [
    {"file": "cbl/CBACT04C.cbl", "line": 464, "from": "DIS-INT-RATE", "to": "WS-MONTHLY-INT", "change": "computed"},
    {"file": "jcl/CREASTMT.JCL", "line": 54, "from": "offset 132", "to": "offset 148", "change": "moved by the sort"},
    {"file": "cbl/CBSTM03A.CBL", "line": 678, "from": "TRNX-AMT", "to": "ST-TRANAMT", "change": "becomes edited text"},
]


def main(root: str, out: str) -> None:
    base = Path(root) / APP
    rows = []
    for kind, f, line, text, what in STEPS:
        src = (base / f).read_text(encoding="utf-8", errors="replace").splitlines()
        assert text in src[line - 1], f"{f}:{line} does not contain {text!r}: {src[line - 1]!r}"
        rows.append({"kind": kind, "file": f"{APP}/{f}", "line": line, "text": src[line - 1].rstrip(), "what": what})
    for c in CHANGES:
        c["file"] = f"{APP}/{c['file']}"
    x = json.loads(Path(out).read_text(encoding="utf-8"))
    x["p5"] = {
        "element": {"program": "CBACT04C", "field": "DIS-INT-RATE", "copybook": "app/cpy/CVTRA02Y.cpy", "line": 9},
        "summary": "The interest rate becomes monthly interest, then a transaction amount (TRAN-AMT), then is merged, sorted, reformatted and printed on the statement (TRNX-AMT, ST-TRANAMT); its total also lands in the account balance.",
        "steps": rows,
        "definition_changes": CHANGES,
    }
    Path(out).write_text(json.dumps(x, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"p5: {len(rows)} steps, {len(CHANGES)} definition changes, all lines verified")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
