# Fixtures

`synthetic-*.json` are hand-built and **committed**. Everything else is a real capture and
is **gitignored** — real responses are a student's own education record, and course codes,
rooms and times together describe a person's daily movements.

---

## `synthetic-quarter.json` — the main fixture

40 rows → **5 sections** (plus 2 holidays and 2 finals), over 4 weeks starting Thu
2026-09-24. Matches the `EventListSet` v2 shape exactly (`d.results`, `__metadata`,
`/Date(ms)/`, `PT…`), and reproduces the traps found in the real capture.

| Section | Pattern | Time | Why it's here |
| --- | --- | --- | --- |
| `SYN-101-LE` | Tu, Th | 09:00–09:50 | **The `getUTCDay()` test.** `getDay()` reports Mon/Wed |
| `SYN-101-DI` | W | 14:00–14:50 | Same `ModuleId` as LE and LA — grouping and color key |
| `SYN-101-LA` | F | 10:00–11:50 | Third component; also a 110-minute block |
| `SYN-202-LE` | M, W, F | 14:00–14:50 | **Collides with `SYN-101-DI`** on Wednesday |
| `SYN-303-SE` | M, W | 16:00–17:20 | Evening, 80 minutes, unusual `TeachingMethod` (Seminar) |

Plus 4 rows that are not regular meetings:

| Rows | What |
| --- | --- |
| 2 holidays | `EventType: "03"`, **both sharing `EventId: "00000000"`**, no room, midnight times. One name has padded whitespace: `"Thanksgiving Day     (guaranteed)"` |
| 2 finals | Extra occurrences on an existing `EventId`, different times, on a weekday the section never otherwise meets — and `EventIsExam` stays **false**, exactly as real TSS emits them |

### Four traps, baked in deliberately

- **Weekday shift.** Every `EventDate` is UTC midnight. Parse with `getDay()` in US Pacific
  and all five sections move back one day. The table above is the correct answer.
- **Holidays create a phantom section.** Group by `EventId` before filtering
  `EventType === "01"` and you get a 6th "section" meeting Wed/Thu at 00:00.
- **Finals corrupt the recurrence.** Take `rows[0]`'s time instead of the modal time and
  `SYN-101-LE` renders as Tue,**Fri**,Thu while `SYN-202-LE` gains a phantom Thursday.
- **`EndDate` is not the last class.** `SYN-101-LE`'s `EndDate` is Fri 2026-12-11, which is
  not a Tu/Th day. Deriving an ICS `UNTIL` from it produces a phantom lecture.

### Expected output

A correct parser produces **5 sections, 2 finals, 2 holidays, and exactly one conflict** —
`SYN-202-LE` against `SYN-101-DI`, both Wednesday at 14:00. A naive one produces 6
"sections" and the wrong weekdays for two of them.

---

## `synthetic-edge-cases.json`

Five rows, each of which should produce a warning or a special render — **never a crash**.

| Row | Condition |
| --- | --- |
| `SYN-404-LE` | Async/online: `StartTime` and `EndTime` are `""`, `Location` is `MC Online` |
| `SYN-101-FI` | `EventIsExam: true` |
| `SYN-606-LE` | `Room: "TBA"` |
| `SYN-707-LE` | `StartTime: "PT11HXXM"` — unparseable |
| `SYN-808-ST` | `TeachingMethod: "Studio"` — not Lecture/Discussion/Laboratory |

One row failing must not take down the other four.

> Note: the async row uses `""` for the missing times because SAP generally emits empty
> strings rather than omitting keys — but this has **not** been observed on a real async
> section. Handle both `""` and `undefined`.

---

## `synthetic-empty.json`

`{"d":{"__count":"0","results":[]}}`. Between quarters this is the normal response, not an
error. The UI should say so rather than rendering a blank grid.

---

## `synthetic-sections.json` — for the join

Schedule of Classes, **OData v4** shape (`value` array, ISO dates). Four sections matching
`synthetic-quarter.json` by `EventObjid`.

Mirrors the real format quirks:

- `EventID` is `"E 00000101"` — prefix and space, versus the timetable's bare `"00000101"`
- `ModuleID` is `"1111"` unpadded, versus the timetable's `"00001111"`
- `InstructorEmail` is `"mailto: DREYES@EXAMPLE.EDU"` — note the space
- `Sched` is free text: `Tu, Th 09:00 AM - 09:50 AM In Person @ Galbraith Hall Room 101`
- The online row's `Sched` has **no `@ venue` segment** and a trailing space
- One row carries a `Final Examination` line after a `\n`

⚠️ **Join on `ModuleID` + `EventObjid` together, never `EventObjid` alone.** In the real
capture, filtering 8 sections by `EventObjid` alone returned 17 rows and pulled in
unrelated courses — `607` matched both COGS-108 and BENG-299. `EventObjid` is unique only
within a module.

Not represented here, but present in real data: a `Sched` of `"Schedule Not Defined"`
(independent study, `EventPkgLimit: 9999`), and one lecture matching several rows because
it is shared across enrolment packages. Both are worth adding if you extend this fixture.

Instructors and buildings are invented. Nothing here describes a real person.

---

## Regenerating

These were generated once and are meant to be edited by hand from here. If you add a case,
add a row to the table above so the reason it exists doesn't get lost.
