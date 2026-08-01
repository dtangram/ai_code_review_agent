## AI Features

Hero Log combines Retrieval-Augmented Generation (RAG), semantic vector search, and direct LLM queries — using whichever pattern fits each feature — to help collectors explore and understand their comic book collections.

### 🔍 Search the Multiverse

Three distinct AI-powered search modes, each using a different technique suited to the problem — not all three are RAG:

- **My Collection (semantic retrieval)** — Comic descriptions in the user's collection are embedded using OpenAI's embeddings API and stored in PostgreSQL. Search queries are embedded at request time and matched against stored vectors via similarity search, returning results ranked by a similarity score. This lets users search their own collection using natural, descriptive language (e.g. *"dark 90s Batman"*) instead of exact title matches. Retrieval only — no generation step.

- **All Comics (LLM knowledge query)** — Queries outside the user's collection are answered directly by the Claude API, drawing on its general knowledge of the comics universe to surface relevant titles, publishers, and context. Generation only — not RAG, since nothing is retrieved from stored data.

- **Find Missing (RAG: hybrid retrieval + generation)** — The one mode that's true end-to-end RAG: Claude generates candidate comics from its general knowledge, then those results are cross-referenced against the user's retrieved collection data, flagging which suggested comics are already owned vs. missing — turning a knowledge query into a personalized, actionable result.

### 📸 Cover Scan → Auto-Fill

Uploading a photo of a comic's cover lets users skip manual data entry entirely. The image is sent directly to the Claude API (vision), which identifies details like title, issue number, publisher, and other cataloging fields, then returns them as structured data used to pre-fill the entry form. Users can review and edit before saving — keeping a human in the loop rather than trusting AI output blindly.

### 📊 Collection Intelligence

A dedicated insights view analyzes a user's full collection — series completion percentages, missing issues, variant counts — and uses an LLM to generate plain-language analysis and personalized recommendations (e.g. which issues to prioritize picking up next).

### Stack

- **Architecture pattern:** Retrieval-Augmented Generation (RAG)
- **Embeddings:** OpenAI Embeddings API
- **Generation:** Claude API (Anthropic)
- **Storage/Retrieval:** PostgreSQL
- **Backend:** Node.js, Express
- **Frontend:** React, TypeScript

### Design notes

Each AI feature was matched to the pattern that fit the problem, rather than defaulting to one approach everywhere: semantic search for querying data we own, direct LLM queries for open-ended knowledge questions, a hybrid approach where both were needed, and vision-based extraction for turning a photo into structured data. Wherever AI output feeds into user data — search match confidence, or auto-filled form fields from a scanned cover — the UI surfaces it as a suggestion the user can verify or edit, rather than treating it as ground truth.
