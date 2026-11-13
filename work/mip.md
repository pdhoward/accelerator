# MIP: the Mainframe Intelligence Pack

*Strategic Machines · started 2026-11-12 · status: P1 (L2), P2 (resolution, interfaces) and P3 (L3 semantics) built and passing: platform `90a0353`, `f6bb2e1`, `22fd940`, `packs/mip`. Next: P4 (rules, with AI on the review queue)*

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
| M7 | **MIP is native: no third-party COBOL parser** (the Owner, 2026-11-12) | cobol-py and ProLeap are studied and used only as independent referees in evaluation, never as components. The one outside library is SQLGlot, a general SQL parser for embedded SQL: **kept** (the Owner, 2026-11-12) |
| M8 | **AI where static analysis stops, never instead of it** (the Owner, 2026-11-12) | The deterministic engine states what the code provably does, cited. Where it can't (values set at run time, targets held in data or in configuration that isn't in the repository, interfaces that don't line up), it writes a review item with the evidence. The model then proposes an answer or an explanation, marked as a proposal, and flags what a person must decide. The model never asserts a path the code map doesn't contain (gen3-cradle.md §1.6) |
| M9 | **The rule review runs on the platform's runner, not in MIP** (2026-11-12) | MIP stays deterministic and offline: it writes candidates with their evidence. The runner (`apps/runner/src/mip.ts`) sends each candidate with the industry pack to Claude (Opus 5.5, structured output, server-side refusal fallback) and gets back a fixed shape: name, statement, kind, concept, policy, criticality, inputs, outcome, an answer to every review item, findings, confidence. Keys stay on the runner |

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
| **P4. Rules** | Candidate decisions (thresholds, eligibility, refusals, status changes) labeled by the model with the industry pack | The three rules proposed with their evidence; every review item answered with a proposal or flagged for a person (impact queries moved to P6) |
| **P5. System-wide data lineage** | A data element followed across the whole system, through every hop and every rename: file hops through JCL (a DD written by one step and read by the next, by dataset name), DB2 column mapping on INSERT/UPDATE as well as SELECT, CALL USING by position, containers and COMMAREAs (built in P4); where its definition changes (PIC, USAGE, scale, sign) along the way; the model proposes identity where only names link (B3, `int_rate` = `interest_rate` = `i-rate`), marked for a person | One element traced end to end on CardDemo's batch cycle (a field written by one job, read by the next, renamed between them), with every function that changes it and every definition change flagged |
| **P6. Whole-system reachability** | Multi-hop `pathsTo` over the code map with the conditions joined along each path; program names passed through the COMMAREA and tables (P2's resolution, applied at every hop); targets held in configuration outside the repository as review items, with runtime evidence when the site supplies it (B22) and the scheduler for batch (B24); impact queries | "What reaches DBCRFUN, and under what conditions?" answered across all callers; "what if the account limit were 12?" answered with every affected program and screen; measured on a generated million-line estate |
| **P7. Cold test** | Run on GenApp, unseen | Report precision and recall against a hand-checked sample; publish the numbers, good or bad |

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

### P3: L3 semantics (2026-11-12), built and passing

Platform `22fd940` (`flow.py`, `trace.py`), native. `python -m mip.trace <repo> <PROGRAM> <line>` answers, for one statement: **applies when** (the conditions it runs under, earlier exits included), **reached from** (PERFORM chains in the program, and the programs that LINK or XCTL to it with their own conditions), **decided by** (where each field in those conditions is set, followed across programs through the COMMAREA by byte offset, through 88-level condition names and group moves), **outcome** (what its block sets and where the calling program reads it), and **needs review**.

| Check | Result |
|---|---|
| **The golden trace (BOZ-R1)** | Reproduced automatically: traces of DBCRFUN 347 (the refusal) and 392 (the success update) cite **21 of 21** lines of the 9-step golden trace |
| **Applies when, DBCRFUN 347** | `NOT (SQLCODE NOT = 0)` (279, an earlier exit) · `COMM-AMT < 0` (307) · `NOT (MORTGAGE or LOAN and facility 496)` (330, an earlier exit) · `WS-DIFFERENCE < 0 AND COMM-FACILTYPE = 496` (344). The success update (392) carries the nested exit: `NOT ((COMM-AMT < 0 AND (MORTGAGE or LOAN …)) OR (COMM-AMT < 0 AND WS-DIFFERENCE < 0 AND COMM-FACILTYPE = 496))` |
| **Decided by** | COMM-AMT ← BNK1CRA's SUBPGM-AMT (COMMAREA offset 8) ← WS-AMOUNT-AS-FLOAT, negated when `SIGNI = '-'` (495). The balance ← DB2 `ACCOUNT.ACCOUNT_AVAILABLE_BALANCE` (245, column by column). The facility type ← CICS `INQUIRE ASSOCIATION ODFACILTYPE` (508) |
| **Review queue** | The facility type is set at run time; DBCRFUN's fail code and success flag reach BNK1CRA by intent (SUBPGM-FAIL-CODE, EVALUATE at 585 → "Sorry insufficient funds…" at 606) but not by position (BNK1CRA's area is 92 bytes): the P2 drift, now shown on the path it breaks |
| **CardDemo sign-on (B25's example)** | "Only admins reach COADM01C" derived from source: `CDEMO-USRTYP-ADMIN` (88 VALUE 'A', COCOM01Y 27) ← `MOVE SEC-USR-TYPE TO CDEMO-USER-TYPE` (COSGN00C 227, after a good read and a matching password) ← `READ DATASET(WS-USRSEC-FILE) INTO(SEC-USER-DATA)` (211); reached from MAIN-PARA → PROCESS-ENTER-KEY when Enter is pressed. Nothing to review |
| **Scale** | Both corpora parse whole: 18,298 statements, no errors, about 0.6 s each. P1 and P2 unchanged; 28 unit tests |

**What P3 taught:** a decision often hides behind an earlier exit several statements up (`IF SQLCODE NOT = 0 … GO TO UAD999`), sometimes nested two IFs deep, so guards must collect every path that leaves the block; only definitions that can reach the use count (an update after the decision in the same paragraph doesn't decide it); a condition name is decided by its parent field; a field is set whenever its group is (READ … INTO a record); and what the caller sees must be checked by position, not assumed by name.

**Honest limits:** reaching definitions are exact within a paragraph and conservative across paragraphs (a definition elsewhere is listed as "may reach"); conditions are kept as written, not simplified; lineage stops at a set depth (three hops by default); loops are shown as a guard, not unrolled.

### P4: rules, with AI on the review queue (2026-11-12), built and passing

Two halves, per M8 and M9. **MIP (deterministic):** `python -m mip.rules <repo> [--programs A,B] --out candidates.json`. A candidate is a block that sets what the calling program receives (a fail code, a success flag, a score, a routing target) under at least one business condition. Conditions only about whether the last call worked (SQLCODE, RESP codes, EIBCALEN, abend codes) and loop controls don't make a rule. The THEN and ELSE of one decision are one candidate. Each candidate carries its trace, the value its outcome takes (a score is an average, so the average is traced too), its review items, and the cited source lines as written. **Runner (the model):** `apps/runner/src/mip.ts` sends each candidate with the industry pack to Claude Opus 5.5 and gets back a fixed shape (M9).

| Check | Result |
|---|---|
| **The three golden rules** | Found with their evidence: **3 of 3** (`python -m mip.bench --p4`). BOZ-R1 at DBCRFUN 346 (4 of 4 decision lines cited), BOZ-R2 at CREACC 382 (5 of 5, into INQACCCU), BOZ-R3 at CRECUST 776 (6 of 6, into all five credit agencies) |
| **Candidates** | Bank of Z: 51 in 13 programs. CardDemo: 139 in 20 programs (menus' routing included, e.g. COUSR03C 200 sets CDEMO-TO-PROGRAM to COSGN00C) |
| **The model's review, Bank of Z** | All 51 reviewed, none failed, **$4.38** in total (about $0.09 each). 24 business, 27 technical. Confidence high on 33, medium on 18 |
| **Every review item answered (exit)** | **21 of 21**: 8 settled by a proposal with its basis, 13 marked for a person (values only known at run time, the BNK1CRA layout drift) |
| **What the model found that the reader didn't flag** | The funds check applies only when the facility type is 496, so other callers can overdraw (DBCRFUN 344). Two account openings for the same customer at once could both pass the ten-account limit: the count is taken before the ENQ, and the ENQ is on the account-number counter, not the customer (CREACC 437). The credit agencies return random scores in this sample (CRDTAGY1 201). Fail code 'C' has no message on the create-customer screen (BNK1CCS) |
| **Pack fit** | The model noticed that Bank of Z is retail banking (sort codes, mortgages, loans) and that the Cards pack doesn't cover it. It left concept and policy empty instead of forcing a match: 50 of 51 have no policy |

**New in the static reader for P4:**

- A `PERFORM` of a paragraph that never returns (GET-ME-OUT-OF-HERE ends in EXEC CICS RETURN) is an earlier exit, so the ten-account check now carries "the customer exists" as a condition.
- A LINK is a definition of its COMMAREA: a value is followed into the called program at the same byte offset (NUMBER-OF-ACCOUNTS → INQACCCU's count).
- A container read back from programs started with RUN TRANSID is followed into each of them (the credit score → CRDTAGY1–5's PUT CONTAINER → the random score).
- The CICS resource definitions in YAML (the resource builder's `resourceDefinitions:`) are read like a CSD, so transactions OCR1–OCR5 resolve to CRDTAGY1–5.
- Reaching definitions:
  - a definition later in the same loop counts, because it ran on the previous pass;
  - main-path definitions come before error paths, so the cap keeps the ones that make the business value.
- Interface review items are raised only where P2 found real drift: an XCTL never returns, and a field past the caller's area is the callee's own extension.

The result is that CardDemo's interface review items fell from 78 to 0, and Bank of Z's 8 are exactly the BNK1CRA → DBCRFUN drift.

P1, P2 and P3 scores are unchanged. 35 MIP tests and 23 runner tests pass.

**Honest limits:**

- The findings are many: 254 across 51 rules, 161 of them for a person. Some repeat the same point from rule to rule. They need ranking and merging before a steward sees them.
- No industry pack fits retail banking yet. A Banking pack (accounts, deposits, lending, customer onboarding, credit checks) is the natural next pack.
- The review runs from the command line. Wiring it into Cradle ingest and the Policy Walk (candidates become policies for the steward, the drift becomes a contradiction to rule on) is the next step for the platform.

### Answers to the Owner's questions (2026-11-12)

**Can a data element be traced across the system, as `int_rate` becomes `interest_rate` in the next batch program and `i-rate` in the next application?** Partly today, fully in P5. Today a value is followed:

- inside a program (every MOVE, COMPUTE, READ INTO, SQL INTO, condition name and group);
- across CICS programs by byte offset through the COMMAREA, both ways (P3, P4);
- into programs started asynchronously, through containers (P4).

The rename is handled where the bytes line up: SUBPGM-AMT in BNK1CRA is COMM-AMT in DBCRFUN. Still missing:

- file hops between batch steps (one job writes a dataset and the next reads it, under another record name);
- DB2 columns written by INSERT and UPDATE;
- CALL USING by position;
- flagging where the definition changes on the way (PIC 9(3)V99 becoming COMP-3, or losing a decimal);
- proposing identity where only the name links two elements.

P5 builds those. The last one is the model's job, marked for a person (B3).

**Across a million-line application, can we trace upstream programs calling downstream programs dynamically?** One hop at a time, today. Every LINK, XCTL, CALL and RUN is in the code map, with targets held in data resolved from the values the source assigns (menus, tables, `'OCR' + counter`). Each trace shows who reaches a statement and under what conditions. Still missing:

- the multi-hop walk: every path from an entry point down to a program, with the conditions joined;
- targets set only in configuration outside the repository (these are review items, settled by runtime evidence from the site, B22);
- batch order from the scheduler (B24).

P6 builds those and measures them on a generated million-line estate. Speed isn't the risk: both corpora read in under a second, and the walk is a graph query.

### P5: system-wide data lineage (2026-11-13), built and passing

`python -m mip.lineage <repo> <PROGRAM> <FIELD>` follows one element forward through the whole system. It tracks the element by its bytes (a record, an offset and a size), not by its name. So `TRAN-AMT` in one program and `TRNX-AMT` in another are the same element when the bytes line up.

**What it follows:**
- moves of values and of untyped groups, including a table entry and back;
- arithmetic, which starts a derived value;
- a WRITE to its DD, the dataset that DD names, and every step that reads that dataset:
  - a SORT, with its INREC/OUTREC reformat;
  - IDCAMS REPRO and IEBGENER;
  - GDG generations;
  - programs, and the programs they CALL;
- CALL USING, in both directions;
- CICS COMMAREAs;
- DB2 columns (UPDATE and INSERT to SELECT and FETCH);
- online programs that read the dataset through the CSD file.

At each hop it records how the definition changes: picture, sign, scale, editing, packed to zoned, and position in the record. It also lists the statements that test or change the element, and shows where the element came from.

| Check | Result |
|---|---|
| **The golden lineage (CardDemo, `p5` in `carddemo.expected.json`)** | **24 of 24** steps cited and **3 of 3** definition changes flagged (`python -m mip.bench --p5`). Every golden line is asserted against the source by `tools/manifest_p5.py` |
| **The path** | `DIS-INT-RATE` (S9(04)V99, from DISCGRP, loaded by IDCAMS) → monthly interest (`(TRAN-CAT-BAL * DIS-INT-RATE) / 1200`: a rate becomes money, no ROUNDED) → `TRAN-AMT` → SYSTRAN(+1) → COMBTRAN's sort and REPRO → the transaction file → CREASTMT's sort, whose OUTREC moves the card number to the front and shifts the amount from byte 133 to 149 → `TRNX-AMT` in CBSTM03A, read for it by CBSTM03B through CALL USING → a table entry (X(318)) and back → `ST-TRANAMT PIC Z(9).99-` on the statement. The interest total also lands in `ACCT-CURR-BAL` (S9(10)V99), which batch exports and five online screens read through `ACCTDAT` |
| **A shared buffer, read precisely** | CBSTM03A passes one 1,000-byte buffer to CBSTM03B for four files. A value comes back only to the calls that set CBSTM03B's dispatch condition (`LK-M03B-DD = 'ACCTFILE'`, found on the PERFORM chain, and condition names such as `SET M03B-READ TO TRUE`). It stays valid only until the buffer is filled again. Without this, the balance appeared in the card cross-reference record |
| **DB2 (Bank of Z)** | `ACCOUNT.ACCOUNT_AVAILABLE_BALANCE` is updated by DBCRFUN and XFRFUN, and read by DELACC, INQACC and UPDACC. Each move out of it flags COMP-3 → DISPLAY |
| **Same name, no path (B3)** | Fields elsewhere whose names say the same business words (abbreviations expanded: INT = INTEREST, AMT = AMOUNT; an initial can stand for a word, so `I-RATE` matches `INTEREST-RATE`) are listed for the model to propose and a person to confirm. For `TRAN-AMT`, these are the `WS-TRAN-AMT +99999999.99` fields on the transaction screens, where the same amount is entered online. CardDemo has no other interest-rate field |
| **Scale** | 253 traces across both corpora, 0 errors, at most 0.3 s each. P1–P4 unchanged; 41 unit tests |

**Fixed on the way:**
- A concatenated DD (the unnamed second SORTIN) now keeps its name.
- SORT and IDCAMS control statements are kept per step.
- A CICS file seen first in a program and then in the CSD keeps the CSD's dataset name. Online readers had been missing because of this.

**Honest limits:**
- **Ordering:** within a program the lineage doesn't follow statement order. The exception is a buffer filled by a call, which is followed only until it's filled again.
- **Job order:** it isn't checked. GDG generations (+1) and (0) are treated as the same dataset; the scheduler is B24.
- **Not followed yet:**
  - procedures (EXEC PROC);
  - several SORT outputs (OUTFIL);
  - SORT INCLUDE and OMIT, which filter records rather than move them;
  - 01-level REDEFINES;
  - STRING and UNSTRING;
  - IMS segments and MQ messages;
  - CICS WRITE into a file that batch reads.
- **Names:** same-name candidates are listed. The model's proposal for each is the next step on the runner, like the P4 review.

### Next: P6, whole-system reachability

See the plan (§9). Reachability builds on P5: lineage answers "where does this value go?", and P6 answers "what can reach this program, and under what conditions?", across every hop, then "what changes if the account limit becomes 12?".
