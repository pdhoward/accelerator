"""
P2 expected results for CardDemo (mip.md §12): what resolution and the interface checks must find there.

    python -I manifest_carddemo.py <carddemo repo> <out.json>

Hand-verified 2026-11-12; every evidence line is checked against the source, so this fails if it drifts.
"""
import json
import subprocess
import sys
from pathlib import Path

repo, out = Path(sys.argv[1]), Path(sys.argv[2])
REVISION = subprocess.run(["git", "-C", str(repo), "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
CPY, CBL = "app/cpy/", "app/cbl/"


def ev(path, line, must):
    text = (repo / path).read_text(encoding="utf-8", errors="replace").splitlines()[line - 1]
    assert must.upper() in text.upper(), f"{path}:{line} does not contain {must!r}: {text.strip()!r}"
    return {"file": path, "line": line, "text": text[6:72].rstrip()}


menu = ["COACTVWC", "COACTUPC", "COCRDLIC", "COCRDSLC", "COCRDUPC", "COTRN00C", "COTRN01C", "COTRN02C", "CORPT00C", "COBIL00C", "COPAUS0C"]
menu_lines = [28, 34, 40, 46, 52, 58, 64, 71, 77, 83, 89]
admin = ["COUSR00C", "COUSR01C", "COUSR02C", "COUSR03C", "COTRTLIC", "COTRTUPC"]

manifest = {
    "schema": "mip-expected/1",
    "corpus": {"name": "AWS CardDemo", "revision": REVISION},
    "p2": {
        "resolved": [
            {"program": "COMEN01C", "kind": "xctl", "line": 156, "via": "CDEMO-MENU-OPT-PGMNAME", "values": menu,
             "evidence": [ev(CBL + "COMEN01C.cbl", 156, "EXEC CICS XCTL"), ev(CBL + "COMEN01C.cbl", 157, "CDEMO-MENU-OPT-PGMNAME")] + [ev(CPY + "COMEN02Y.cpy", l, p) for l, p in zip(menu_lines, menu)] + [ev(CPY + "COMEN02Y.cpy", 93, "REDEFINES CDEMO-MENU-OPTIONS-DATA"), ev(CPY + "COMEN02Y.cpy", 97, "CDEMO-MENU-OPT-PGMNAME")]},
            {"program": "COADM01C", "kind": "xctl", "line": 145, "via": "CDEMO-ADMIN-OPT-PGMNAME", "values": admin,
             "evidence": [ev(CBL + "COADM01C.cbl", 145, "EXEC CICS"), ev(CBL + "COADM01C.cbl", 146, "CDEMO-ADMIN-OPT-PGMNAME")] + [ev(CPY + "COADM02Y.cpy", l, p) for l, p in zip([29, 34, 39, 44, 49, 53], admin)] + [ev(CPY + "COADM02Y.cpy", 59, "CDEMO-ADMIN-OPT-PGMNAME")]},
        ],
        "interfaces": [],
        "no_findings_expected": "CardDemo's screens share CARDDEMO-COMMAREA (COCOM01Y) and extend it with fields of their own, copying only the bytes passed (MOVE DFHCOMMAREA(1:EIBCALEN) TO CARDDEMO-COMMAREA): compatible, not drift. The sign-on (COSGN00C) never reads its COMMAREA.",
        "evidence": [ev(CBL + "COTRN00C.cbl", 111, "DFHCOMMAREA(1:EIBCALEN)")],
    },
}
out.write_text(json.dumps(manifest, indent=1, ensure_ascii=False), encoding="utf-8")
print("ok: carddemo P2 expectations,", sum(len(r["evidence"]) for r in manifest["p2"]["resolved"]) + 1, "verified lines")
