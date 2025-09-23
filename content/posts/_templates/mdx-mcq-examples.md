# MCQ Examples and Authoring Best Practices

This file contains MCQ examples you can copy into MDX posts and best practices for writing engaging, educational MCQs.

## Simple MCQ (knowledge check)

```mdx
<MCQ
  question="Which test is most useful to exclude inflammatory bowel disease in a patient with diarrhea?"
  choices={["Fecal calprotectin", "Abdominal X-ray", "Antibiotic susceptibility", "H. pylori test"]}
  answer={0}
  id="mcq-001"
/>
```

## Clinical decision MCQ

```mdx
<MCQ
  question="A 22-year-old with nodulocystic acne not responding to oral antibiotics should next be considered for:"
  choices={["Oral isotretinoin", "Topical benzoyl peroxide", "Oral metronidazole", "Refer for biopsy"]}
  answer={0}
  id="mcq-002"
/>
```

## Best Practices

- Keep questions concise and focused on a single learning objective.
- Use 3-5 answer choices. One unambiguously correct answer is best.
- Avoid "all of the above" or double negatives.
- Provide citations in the surrounding text rather than inside choices.
- Place MCQs near the end of sections or after a summary for self-assessment.
- Use `id` to track analytics or anchor explanations in follow-up content.

## Chakra styling guidance

- `MCQ` uses Chakra primitives for buttons and badges. It respects color mode automatically.
- For complex layouts, create a dedicated client component in `components/` and add it to the MDX mapping in `pages/[category]/[slug].tsx`.

---

If you want, I can insert translated MCQs for `hi` and `ru` posts next (requires translations).