# Placeholders

Tracking list of content still needed before launch. Fill in as real content arrives and
remove items once resolved.

- [ ] Site copy
- [ ] Product facts
- [ ] Protocols
- [ ] Case studies
- [ ] Certificates


# Missing Content

The following information is currently unavailable and must NOT be invented:

- verified ingredient list
- clinical statistics
- patient case data
- certificate numbers
- manufacturer details
- exact protocols
- dosage
- treatment intervals
- contraindications

When needed in the frontend, use:

[CONTENT REQUIRED]

# Where [CONTENT REQUIRED] appears on the built site

The homepage is implemented; these are the slots that render a visible
placeholder until real content is supplied. Each is deliberate — nothing was
filled with invented text to make the page look finished.

| Section | Slot |
|---|---|
| 03 Manifesto | none — the unverified 93% statistic was removed, not replaced |
| 04 Formula | ingredient description × 5 (PDO, PN, Vitamin C, Glutathione, Hyaluronate) |
| 05 Transformation | approved before/after imagery; verified clinical data |
| 06 What changes | description × 5 chapters |
| 08 Protocols | protocol description, three benefits, indications, course, compatibility |
| 09 For cosmetologists | direction descriptions and benefits; three document files |
| 10 Korea / science | four pillar descriptions; verified certificates |
| 11 Cases | approved photos, patient, request, procedure count, result, outcomes |
| 12 Private selection | personalised recommendation; lead-form endpoint |
| 13 Footer | phone, e-mail, address, hours, privacy policy, terms |

# Source-of-Truth Hierarchy

When drafting any of the files in this directory, trust sources in this
order (highest first):

1. `content/product-facts.md`
2. `content/certificates.md`
3. Primary manufacturer / clinical documents
4. Other verified project documents
5. `public/references/instagram/` (positioning, visual language, content
   themes, storytelling ideas, terminology candidates — never facts)
6. Any other visual reference (wireframes, mood boards) — visual direction
   only

Instagram content and wireframe mockup copy are not medical evidence and
must never be copied into this directory as fact. Every claim sourced from
either is tracked in `docs/claims-verification.md` before it can be
considered for use here — check that file's status column
(`VERIFIED` / `UNVERIFIED` / `LEGAL-REVIEW` / `DO-NOT-USE` /
`VISUAL-REFERENCE-ONLY`) before writing anything derived from it.

# Safe Conservative Wording

Until a claim is `VERIFIED`, use non-diagnostic, non-comparative language
instead of inventing a substitute number or mechanism claim. Examples:

- "поддерживает качество кожи"
- "участвует в комплексной формуле"
- "используется как компонент формулы"
- "поддерживает увлажнённость"
- "антиоксидантный компонент"

Never publish: exact clinical percentages, comparative superiority claims
("works as long as PLLA," "safer than," "best," "number one," "world
first"), named certificates without the actual certificate on file, or any
Nobel Prize / named-individual endorsement material — see
`docs/claims-verification.md` for the full ledger and reasoning.
