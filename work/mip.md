# MIP: the Mainframe Intelligence Pack

*Strategic Machines · started 2026-11-12 · status: P1 (L2 structure) and P2 (resolution, interface checks) built and passing: platform `90a0353`, `f6bb2e1`, `packs/mip`. Next: P3 (L3 semantics)*

**MIP** is the platform's technology pack for the mainframe family (COBOL, JCL, CICS, IMS, DB2, VSAM). It reads a mainframe application's source, without installing anything on the mainframe, and produces the platform's code map (gen3-cradle.md §11.3.1, B28): programs, entry points, calls, data and the conditions that connect them, every item cited to a file and line. The industry pack and the model then say what that behavior means to the business (§1.6).

The parser is one part of MIP. The product is the knowledge it extracts.

---

## 1. Objectives

1. **Reconstruct how an application works, from source alone:** its programs, transactions, jobs and data, and how control and data move between them, with every link cited.
2. **Find the business rules and where they apply:** decisions whose input, rule and visible outcome sit in different programs, traced end to end (B25: "applies when", "reached from", "decided by").
3. **Never invent a relationship.** What source can't prove (a transaction defined only in the CICS system definitions, a value set at run time) is reported as unresolved, never guessed.
4. **Prove it on code we didn't write and didn't tune for:** an IBM-published bank first, then a held-out second application.

The demonstration this aims at: *"We ingested an IBM-published banking application, reconstructed its dependency graph, extracted its business rules, traced data across COBOL programs and transaction systems, and produced an AI-queryable representation of how it works, without installing anything on the mainframe."* Section 6 shows the first piece of it already: the trace found a real interface defect in IBM's current source.

## 2. Decisions so far

| # | Decision | Why |
|---|---|---|
| M1 | **MIP is written in Python**, as a separate process; the TypeScript runner calls it with a list of files and gets the code map back as JSON | The libraries that matter are Python's (cobol-py, SQLGlot for embedded SQL, Lark for JCL). The code map is the contract, so each technology pack uses the language with the best tools |
| M2 | **Structure (L2) is our own line-exact extractor** | It must cite the source's own line numbers, handle IMS and every CICS command, and be fast. cobol-py does none of these as is (§3) |
| M3 | **Deeper semantics (L3) use cobol-py**: data descriptions, REDEFINES, statement-level data flow | It ports ProLeap's grammar and semantic model, so we don't write a COBOL grammar |
| M4 | **ProLeap (Java) is deferred** | It's MIT and well tested but dormant (last parser change January 2024), and cobol-py ports the same model. It becomes the fallback only if cobol-py's speed blocks L3 at scale |
| M5 | **IBM Bank of Z is the primary benchmark**, CardDemo runs alongside it, IBM GenApp is held out | §4 |
| M6 | **JCL is read by a small parser of our own, not Lark** (2026-11-12) | JCL's statement structure is regular (name, operation, operands, continuation, in-stream data); a grammar library added a dependency without making it more exact |

## 3. Evaluation of cobol-py (2026-11-12)

cobol-py 0.2.1 (MIT, PyPI; a Python port of the ProLeap preprocessor, grammar and semantic graph), installed in an isolated environment with pinned versions, run read-only on all 44 CardDemo programs (30,219 lines).

| Measure | Result |
|---|---|
| Programs parsed | **39 of 44.** All 4 IMS programs fail on `EXEC DLI` (not supported). One 2,099-line program (COTRTLIC) fails on a grammar gap |
| Speed | **598 s in total, about 50 lines per second**; worst case 650 lines in 138 s. About 55 CPU-hours per 10 million lines |
| Structure | Good where it parses: CICS XCTL targets and COMMAREAs exact; copybooks with code in them expanded correctly |
| EXEC CICS | 175 of 198 blocks: adjacent blocks are merged into one statement (nothing lost, but they must be split again) |
| Line numbers | **Not the source's:** numbered after copybooks are inlined (an XCTL at COSGN00C line 231 is reported at 567). ProLeap has the same design |
| Project | 12 days of activity (June 2026), one author, 0 stars. Mitigation: pin the version; keep our own copy if it stalls (MIT) |

**Verdict:** a useful semantic front end for L3, not a foundation for L2. Hence M2 and M3.

## 4. The benchmark corpus

| Application | Publisher | Licence | Role |
|---|---|---|---|
| **Bank of Z** ([github.com/IBM/Bank-of-Z](https://github.com/IBM/Bank-of-Z)) | IBM, active (updated 2026-11-12) | Apache-2.0 | **Primary benchmark.** Pinned at `568421969f86` (2026-11-12) |
| **CardDemo** (aws-samples/aws-mainframe-modernization-carddemo) | AWS, written for z/OS | Apache-2.0 | Runs alongside: fills Bank of Z's gaps (§7) |
| **GenApp** ([github.com/cicsdev/cics-genapp](https://github.com/cicsdev/cics-genapp)) | IBM | EPL-2.0 | **Held out:** not read while MIP is built, then run cold. If MIP holds on code it has never seen, the result is evidence, not tuning |

All corpora are cloned read-only into `machine/corpus/`, outside our repositories. Nothing in them is ever run.

## 5. Bank of Z: the source audit

Produced by `work/mip/tools/audit.py` (read-only; every item cited with its original line). Full output: `work/mip/bank-of-z.audit.json`.

**Inventory:** 45 COBOL programs (32 CICS, 11 IMS, 2 batch), 2 PL/I programs, 96 copybooks, 10 BMS maps, 9 IMS DBDs and 8 PSBs, 48 JCL members (3 batch jobs, the rest setup templates), 11 Java files.

| Construct | Found | Where (examples) |
|---|---|---|
| Static CALL | 38 in 13 programs | `CBLTDLI` in the IMS programs; `CEEDAYS`, `CEELOCT` in CRECUST |
| Dynamic CALL | 8, all in IBTRAN | Procedure-pointer calls to the Java Native Interface (FINDCLASS, GETSTATICMETHODID…): to be classified, not resolved |
| PERFORM / PERFORM THRU | 529 / **127** in 8 programs | 102 in BNKSTMTC alone; 11 in BNK2STMT; 2–4 in each IMS program |
| GO TO | 181 in 23 programs | |
| COPY / COPY REPLACING | 130 in 34 programs / **7** | CREACC 275 (`INQACCCU`), XFRFUN 128 (`ACCOUNT`), DELACC 200, INQACC 199… |
| REDEFINES / OCCURS | 118 in 43 programs / 18 in 5 | |
| CICS LINK | **145** | 9 dynamic (`PROGRAM(WS-ABEND-PGM)` → ABNDPROC by `VALUE`; `INQCUST-PROGRAM`, `INQACCCU-PROGRAM`) |
| CICS asynchronous RUN / FETCH | 1 / 3 | CRECUST 687, transaction IDs built in a loop (`'OCR'` + counter, 626) |
| CICS file I/O | 1 | ABNDPROC 141: `WRITE FILE(ABNDFILE)` |
| DB2 (EXEC SQL) | **143** in 17 programs | ACCOUNT, CUSTOMER, PROCTRAN, CONTROL tables |
| IMS DL/I | 31 `CALL 'CBLTDLI'` in 11 programs | no `EXEC DLI` |
| JCL | 3 batch jobs | Programs run through `IKJEFT01` → `DSN RUN PROGRAM(BNK2STMT)` in in-line SYSTSIN (BNK2STMT.jcl 41), not `EXEC PGM=` |

**The connected subset (20 programs):** the menu (BNKMENU), the teller screens BNK1CRA, BNK1TFN, BNK1CAC, BNK1CCS and BNK1DCS, the services they LINK to (DBCRFUN, XFRFUN, CREACC, CRECUST, DELCUS, DELACC, INQCUST, INQACCCU), the five credit agencies (CRDTAGY1–5) and the abend handler (ABNDPROC). Together they cover LINK (static and dynamic), RETURN TRANSID, asynchronous RUN and FETCH, COPY REPLACING, a DB2 cursor and a CICS file.

## 6. Three cross-program business rules, and the golden trace

Each rule's input, decision and outcome sit in different programs. Every line below is verified against the pinned source by `tools/manifest.py`.

**BOZ-R1: A teller debit is refused when it would take the available balance below zero.** Input: BNK1CRA 494–498 (a `-` sign makes the amount a debit). Decision: DBCRFUN 341–347 (`AVAILABLE_BALANCE + amount < 0` → fail code 3). Outcome: BNK1CRA 604–606 ("Sorry insufficient funds available…"). The overdraft limit is read (DBCRFUN 245) but **not applied**; a payment out of a MORTGAGE or LOAN account gets fail code 4 (330–335), which BNK1CRA has **no message for** (612, `WHEN OTHER`).

**BOZ-R2: A customer may hold at most ten accounts.** Input: BNK1CAC 775 (LINK CREACC). Decision: CREACC 327 (customer must exist, INQCUST), 1182 (accounts listed by INQACCCU, at most 20, INQACCCU 464), 380–383 (`NUMBER-OF-ACCOUNTS > 9` → fail code 8). Outcome: BNK1CAC 897–900 ("…too many accounts"). Also: only ISA, MORTGAGE, SAVING, CURRENT and LOAN accounts (CREACC 1303 onward).

**BOZ-R3: A new customer's credit score is the average of the agency scores that arrive in time, and 0 if none do.** Input: BNK1CCS 997 (LINK CRECUST). Decision: CRECUST 687 (five asynchronous requests), CRDTAGY1 201 (each agency returns 1–999; random in this sample), CRECUST 749 (FETCH ANY), 774–776 (none received → 0), 812 (average). Outcome: CRECUST 1219 (customer row inserted), BNK1CCS 1109 (score shown).

**The golden trace: BOZ-R1, end to end (9 steps, 21 verified lines).** The teller's amount and sign (BNK1CRA 494–498) → the request's origin from CICS at run time (503–508) → LINK DBCRFUN with BNK1CRA's own parameter layout (511–513) → DBCRFUN's layout from copybook PAYDBCR (195) → the account read from DB2 (245–270) → MORTGAGE/LOAN refusal (307–335) → insufficient funds (341–347) → balance update and PROCTRAN record (384–441) → the teller's message (BNK1CRA 581–624). Field lineage: screen `AMTI` → `SUBPGM-AMT` (offset 8) → `COMM-AMT` (offset 8) → `WS-DIFFERENCE` → fail code.

**The finding: interface drift (a predicted defect in IBM's current source).** Commit `afb4f68` (2026-07-23, "CICS Account transaction history") added a 40-byte `COMM-DESCRIPTION` to PAYDBCR (line 19) and updated DBCRFUN, XFRFUN, the API mappings and the Java caller. **BNK1CRA declares the same parameters inline and was not updated.** BNK1CRA passes 92 bytes; DBCRFUN addresses 132. DBCRFUN writes its success flag and fail code at offsets 130–131, past the end of BNK1CRA's area, while BNK1CRA reads its flag at offset 90, the start of what DBCRFUN treats as the description. A refused debit would therefore likely be reported to the teller as "Amount successfully applied" with the balance unchanged. This is static analysis only; it needs confirming on a running CICS system, and it is reported as such. It is exactly the class of finding that slicing a system by program name cannot see: the rule is right in DBCRFUN, the screen is right in BNK1CRA, and the fault lives in the interface between them.

## 7. What Bank of Z lacks, and where it comes from instead

| Required feature | In Bank of Z | Filled by (without changing the benchmark) |
|---|---|---|
| CICS XCTL | none (all LINK) | **CardDemo:** 32 XCTL, including the data-driven menu (COMEN01C → a program named in the COMEN02Y table) |
| VSAM KSDS | none declared in COBOL; ABNDFILE's organization not in the repository | **CardDemo:** 11 programs with indexed files, and CICS reads of them (COSGN00C reads the user-security file) |
| EXEC DLI | none (CBLTDLI only) | **CardDemo:** 26 `EXEC DLI` in its IMS module |
| JCL `EXEC PGM=` of application programs, PROCs | none (DSN RUN PROGRAM only) | **CardDemo:** 152 steps, 11 application programs run directly; the POSTTRAN → INTCALC → COMBTRAN → CREASTMT cycle (B24) |
| REPLACE directive | none (COPY REPLACING only) | Not found in either; NIST COBOL-85 test programs if needed |
| CICS system definitions (CSD) | not in the repository | CardDemo ships its CSD (transaction → program) |
| Older-style CICS, VSAM | — | **GenApp** (held out); to be audited only when it is run cold |

CardDemo is AWS-authored (Apache-2.0) but written for and run on z/OS; it is the best public source of the missing constructs we have verified. An IBM-published batch sample (the Redbooks insurance application) has not been located or verified yet.

## 8. The golden dataset

| File | What it is |
|---|---|
| `work/mip/bank-of-z.expected.json` | The expected results (schema `mip-expected/1`): the corpus and revision; the 20-program subset; 132 expected edges (LINK, dynamic LINK with the literal that resolves it, RETURN TRANSID, asynchronous RUN, CALL, CICS file I/O); 29 SQL accesses; 89 COPY statements (REPLACING marked); 3 batch steps through DSN; 4 things MIP must report as **unresolved**; the 3 rules; the golden trace with lineage and the finding; the absent features |
| `work/mip/bank-of-z.audit.json` | The full audit of the repository at the pinned revision |
| `work/mip/tools/audit.py` | The audit (read-only, Python standard library) |
| `work/mip/tools/manifest.py` | Builds the expected results and **verifies every evidence line** against the source; it fails if any cited line doesn't say what we claim |
| `work/mip/tools/eval_cobolpy.py` | The cobol-py evaluation (§3) |

Regenerate: `python -I work/mip/tools/audit.py <bank-of-z> work/mip/bank-of-z.audit.json`, then `python -I work/mip/tools/manifest.py <bank-of-z> work/mip/bank-of-z.audit.json work/mip/bank-of-z.expected.json`.

The expected edges come from our audit, which is itself pattern-based: they are a starting point to be reviewed by hand as MIP is built, and disagreements between MIP and the manifest are resolved by reading the source, never by trusting either side.

## 9. The proof-of-concept plan (Python)

**Shape.** `mip analyze <manifest>` reads a list of source files and writes a code-map part (JSON, `CodeMapPart` in `packages/domain/src/code-map.ts`). The runner calls it as the COBOL, JCL, CICS, DB2 and IMS technology packs. Python 3.12, dependencies pinned and vendored (cobol-py, antlr4-python3-runtime, SQLGlot, Lark, NetworkX), pre-built packages only, no network at run time.

| Stage | Builds | Exit criterion |
|---|---|---|
| **P1. L2 structure** | Source normalizer (columns, continuations, comments, original line numbers); COBOL extractor (PROGRAM-ID, paragraphs and sections, PERFORM/THRU, GO TO, CALL static/dynamic, COPY/REPLACING, SELECT/FD); EXEC CICS (every command, split per block, PROGRAM/FILE/TRANSID/COMMAREA); EXEC SQL through SQLGlot (tables and verbs); IMS (CBLTDLI/AIBTDLI calls and EXEC DLI, function codes, PCBs); JCL through Lark (JOB, EXEC PGM/PROC, DD/DSN, SYSTSIN `RUN PROGRAM`) | On Bank of Z: every expected edge, SQL access, COPY and batch step in the manifest found, at the cited line; nothing in "unresolved" asserted. On CardDemo: the same for XCTL, VSAM, EXEC DLI and the batch cycle |
| **P2. Resolution** | Dynamic targets by literal assignment (VALUE, MOVE) and by constant evaluation (the `'OCR'` + counter loop); COMMAREA layouts by byte offset across LINK and XCTL | WS-ABEND-PGM → ABNDPROC, INQCUST-PROGRAM → INQCUST, RUN TRANSID → {OCR1…OCR5} (program unresolved, as expected); **the BNK1CRA/PAYDBCR layout mismatch detected automatically** |
| **P3. L3 semantics** | cobol-py per program (parallel, cached by source hash), mapped back to original lines; data definitions with REDEFINES and OCCURS; definitions and uses (MOVE, COMPUTE, arithmetic, I/O); the conditions guarding each statement | The golden trace reproduced: every step and every lineage hop, with its condition, at the cited lines |
| **P4. Rules and queries** | Candidate decisions (thresholds, eligibility, refusals, status changes) labeled by the model with the industry pack (Cards, banking); `pathsTo` for "reached from"; impact queries | The three rules proposed with their evidence; "what if the account limit were 12?" answered with every affected program and screen |
| **P5. Cold test** | Run on GenApp, unseen | Report precision and recall against a hand-checked sample; publish the numbers, good or bad |

**Measures** (targets, not results): ≥ 99% of supplied files inventoried; ≥ 98% precision on L2 constructs; ≥ 95% recall on literal calls; ≥ 90% precision on the scoped L3 lineage; 100% of published rules carry source evidence; every unresolved dependency reported. Also measured: lines per CPU-second, memory per program, and the cost of the model calls.

## 10. Constraints honored

- No mainframe and no IBM installation needed: static analysis of public source.
- No relationship invented: the unresolved list (CSD transactions, run-time facility type, ABNDFILE's organization, JNI calls) is part of the expected results.
- Original line numbers and the repository revision are preserved; every evidence line is machine-verified.
- Correctness and evidence before the parser: the golden dataset exists before MIP does.
- Downloaded code is only read, never run; tools run in an isolated environment.

## 11. Risks

- **Dialects and missing pieces.** Real estates arrive without copybooks, CSDs or catalogs. MIP must give partial answers and say what's missing.
- **Speed at L3.** cobol-py's speed (about 50 lines per second) makes L3 a background, cached, parallel job. ProLeap is the fallback.
- **One author's style.** Mitigated by three corpora from two publishers and a held-out test.
- **The model's role.** It labels and explains what the analysis proves; it never asserts a path the graph doesn't contain (§1.6).

## 12. Progress

### P1: L2 structure (2026-11-12), built and passing

`accelerator-platform/packs/mip` (platform `90a0353`): Python, one pinned dependency (SQLGlot), 11 unit tests. `python -m mip analyze <repo>` writes the code map; `python -m mip.bench` scores it against a golden file.

| Check | Result |
|---|---|
| **Bank of Z vs the golden file** | **100% recall and 100% precision in all 8 categories:** 108 LINKs (dynamic ones resolved to ABNDPROC, INQCUST, INQACCCU by their literals), 20 RETURN TRANSIDs, 89 COPYs (REPLACING marked), 29 SQL accesses (cursors traced to their tables), 3 batch steps (through DSN RUN PROGRAM), the asynchronous RUN, calls, the CICS file write. The RUN's programs are left unresolved, as required. 0.37 s for the whole repository |
| **CardDemo, the features Bank of Z lacks** | 32 XCTL (30 through data; the menu's `CDEMO-MENU-OPT-PGMNAME(WS-OPTION)` correctly left data-driven), 26 EXEC DLI and 9 CBLTDLI with their function codes, 11 programs with indexed (VSAM) files, 52 CICS file commands, 159 JCL steps, 25 CSD transactions with their programs; 0 diagnostics; 0.43 s |
| **Independent cross-check** | Static CALL targets agree with cobol-py (ProLeap's grammar, a separate implementation) on **all 39** CardDemo programs it can parse |
| **Speed** | About 70,000 lines per second, against cobol-py's 50 |

**What P1 taught (each now a unit test):** an apostrophe in `AUTHOR. James O'Grady.` opened a literal that swallowed a whole program (free-text identification entries are now skipped, and a literal never runs past its line); code past column 72 can cut an `END-EXEC` (a block now never swallows the next `EXEC`, and the case is reported); a subscripted target (`PROGRAM(X(WS-OPTION))`) keeps its name apart from its subscript; an SSA's segment name is often a FILLER.

**The golden file was wrong once, and MIP found it:** the audit read `FETCH FROM ACC-CURSOR` as a table called ACC; MIP traced the cursor to its DECLARE on ACCOUNT. The manifest builder now takes a FETCH's tables from its cursor, and the correction is recorded in `tools/manifest.py`.

**Honest limits of P1:** the golden edges came from our own audit, so agreement on Bank of Z is MIP agreeing with a pattern reading checked by hand on the rules and trace; the cobol-py cross-check is the independent evidence so far. Copybooks are analyzed as themselves (not inlined), so a call inside a copybook belongs to the copybook and reaches a program through its COPY edge. Some IMS calls have no segment (SCHD, TERM, or a segment held in data). The code map JSON carries fields the TypeScript type doesn't yet declare (`scope`, `command`, `sql`, `dli`), to be added when the runner calls MIP.

### P2: resolution and interface checks (2026-11-12), built and passing

Platform `f6bb2e1`. Expected results: `work/mip/bank-of-z.expected.json` (new `p2` section) and `work/mip/carddemo.expected.json` (built by `tools/manifest_carddemo.py`); every evidence line verified against the source.

| Check | Result |
|---|---|
| **Tables** | CardDemo's menus resolve to the programs in their tables, read byte for byte the way the program reads them: COMEN01C → 11 programs (COACTVWC … COPAUS0C), COADM01C → 6 (COUSR00C … COTRTUPC) |
| **Constant evaluation** | Bank of Z's `RUN TRANSID(WS-RUN-TRANSID)` → OCR1–OCR5, from `STRING 'OCR' WS-CC-CNT` inside `PERFORM VARYING WS-CC-CNT FROM 1 BY 1 UNTIL WS-CC-CNT > 5`. The programs those transactions run stay unresolved (no CSD), and no program is asserted |
| **Interfaces, Bank of Z** | 145 LINK/XCTL COMMAREAs compared byte for byte: 142 same, 1 compatible, 2 drift. **BNK1CRA → DBCRFUN, high, found automatically:** BNK1CRA passes 92 bytes; DBCRFUN uses COMM-DESCRIPTION (90–129), COMM-SUCCESS (130) and COMM-FAIL-CODE (131). **DELCUS → DELACC, low:** DELCUS declares two PCB pointers, DELACC's copybook three, and DELACC never uses the third. No unexpected findings |
| **Interfaces, CardDemo** | 68 compared: 31 same, 23 compatible, 14 not read, **no drift.** Its screens extend the shared COMMAREA (COCOM01Y) with fields of their own but copy only the bytes passed (`MOVE DFHCOMMAREA(1:EIBCALEN) TO CARDDEMO-COMMAREA`); the sign-on never reads its COMMAREA |
| **Regression** | P1 still 100% on all 8 Bank of Z categories; static CALLs agree with cobol-py on 39/39; 22 unit tests |

**What P2 taught (each now a unit test):** PICTURE strings contain periods (`+9(10).99`) and must be one token; `COPY X REPLACING X-COMMAREA BY DFHCOMMAREA` is how a program names its COMMAREA; a copied 01 record stands alone and the fields after it continue it (`COPY COCOM01Y.` then `05 CDEMO-CT00-INFO`); two copybooks can share a name, so the one nearest the program wins, as in a compiler's library search; and a layout difference is not a defect by itself. The rules that keep findings honest: opaque bytes read as a structure are compatible; a bounded `(1:EIBCALEN)` copy lets the called program extend the area safely; severity depends on whether the called program actually uses the conflicting field. Four apparent drifts were checked against the source and found false before those rules existed; that is why each rule exists.

### Next: P3, L3 semantics

Within each program: control flow (PERFORM, PERFORM THRU, GO TO, fall-through), the conditions guarding each statement, and data flow (where each field is set and read), using cobol-py's semantic graph mapped back to source lines. Across programs: values carried through COMMAREAs by byte offset (the layouts P2 built). Exit: the golden trace (BOZ-R1) reproduced step by step, every hop with its condition and citation.
