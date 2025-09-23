# MDX Authoring Template — Premium posts

Use this template when creating new MDX posts. It produces clean, accessible, and Chakra-friendly layouts and supports interactive components (MCQ) safely.

---

Frontmatter (required)

```yaml
---
title: "Post title"
slug: "post-slug"
date: "2025-09-23"
lang: ["en"]
category: "medical"
tags: ["gastroenterology", "ibd"]
description: "Short summary for previews"
thumbnail: "https://..." # optional external thumbnail
---
```

Content structure (recommended)

- H1: title (MDX will render header automatically)
- Intro paragraph
- Section headings (H2) for disease summary, pathophysiology, clinical features, diagnosis, treatment, disposition
- Use `<details>`/`<summary>` for collapsible lists (server-renderable) instead of client-only Collapse<br/>
- Add images using standard markdown `![alt](https://...)` linking to public-domain resources or your own `public/` assets

Interactive MCQ component

- Use the `MCQ` component to add multiple-choice quizzes. The component hydrates on the client and is safe to include in MDX.
- Example MDX usage (English):

```mdx
{/* Place near the end or after a section */}
<MCQ
  question="Which test is most useful to exclude inflammatory bowel disease in a patient with diarrhea?"
  choices={["Fecal calprotectin", "Abdominal X-ray", "Antibiotic susceptibility", "H. pylori test"]}
  answer={0}
  id="ibd-01"
/>
```

Accessibility & design tips

- Keep question text short and clear.
- Provide 3-5 choices; avoid negative questions.
- Use `id` to reference questions from the text or for analytics.
- Use images with descriptive alt text. Prefer public-domain medical diagrams (Wikimedia Commons) or institutionally licensed assets.

Chakra-friendly MDX components

- The site maps common HTML tags to Chakra styles automatically. Avoid importing Chakra components directly inside MDX unless absolutely necessary.
- For complex interactive widgets, create a client component (in `components/`) and import it by name in MDX (we already provide `MCQ`).

Publishing checklist

- [ ] Frontmatter filled correctly
- [ ] Images use external stable URLs or are added to `public/` and referenced as `/images/...`
- [ ] No client-only imports (avoid `next/image`, Chakra components directly)
- [ ] Add at least one MCQ or interactive element for engagement (optional)
- [ ] Spellcheck and medical peer review

---

If you want I can auto-insert an example MCQ into each existing MDX post (English first), then you can provide translations for the localized posts. Reply "Insert MCQs into English posts" to continue.