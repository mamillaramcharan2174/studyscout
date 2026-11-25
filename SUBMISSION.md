# Hackathon Submission: StudyScout (Theme 4: Research & Knowledge Agents)

## Project Concept & Problem Statement

Students and academic researchers spend hundreds of hours sifting through conflicting literature, unformatted course lecture notes, and secondary summaries. Existing AI assistants either hallucinate unverified citations, fail to process uploaded course documents alongside live web data, or present one-sided conclusions without flagging critical empirical disagreements.

**StudyScout** solves this by implementing an autonomous **Plan–Act–Observe** research agent. It deconstructs student questions into focused sub-questions, allows the student to review and edit the plan, conducts native tool calls across live web and uploaded documents, validates all data schemas with **Zod**, explicitly identifies conflicting evidence, and produces a structured academic report with verifiable citations and follow-up Q&A.

---

## Required Workflow Compliance Checklist

| Requirement | Implementation in StudyScout | Status |
| :--- | :--- | :--- |
| **1. User enters question & uploads PDF/TXT/DOCX** | Full drag-and-drop file staging, `pdf-parse`, `mammoth` (Word), and text extraction with semantic paragraph chunking and page indexing. | ✅ Complete |
| **2. Short, editable research plan** | Agent decomposes question into 3–4 sub-questions with rationale, source types (`web`, `document`, `academic`), and keywords. | ✅ Complete |
| **3. Review & edit plan before starting** | Interactive Plan Editor allows students to edit question phrasing, add/remove sub-questions, and toggle target sources. | ✅ Complete |
| **4. Searches at least two kinds of sources** | Implements 4 real tools: `web_search` (Wikipedia REST API + DuckDuckGo), `document_retrieval` (uploaded file chunk scoring), `academic_search` (CrossRef journal DOIs), and `evidence_verifier`. | ✅ Complete |
| **5. Records steps, tool calls, observations & retries** | Every invocation logs `toolName`, `validatedInputs`, `validatedOutputs`, `observation`, `thought`, and `durationMs` with live SSE streaming. Automatically reformulates queries and retries upon 0 results. | ✅ Complete |
| **6. Compares evidence & flags conflicts** | Evidence Matrix isolates agreements, flags side-by-side **View A vs View B** contradictions, and synthesizes nuanced resolutions. | ✅ Complete |
| **7. Structured research report** | Executive summary, key findings with confidence tags, cited evidence, conflict breakdown, limitations, open questions, and bibliography with clickable links. | ✅ Complete |
| **8. Grounded follow-up Q&A** | Context-aware chat drawer answering student inquiries grounded in the generated report and uploaded files with active citations. | ✅ Complete |
| **9. Saved research sessions** | Persistent local JSON database (`data/sessions.json`) with session switching, search, deletion, and Markdown/JSON/PDF exports. | ✅ Complete |

---

## Distinctive Technical Highlights

1. **Native Function Calling Architecture**: No hardcoded `if/else` chains. Tools are defined with declarative parameter schemas, validated via Zod, and invoked dynamically based on question objectives.
2. **Multi-Source Evidence Triangulation**: Connects live secondary web sources with student primary documents and peer-reviewed scientific DOIs.
3. **Transparent Execution Audit Trail**: Real-time SSE event stream visualizes agent thinking, tool inputs, execution latencies, and error recoveries.
4. **Zero-Failure Architecture**: Works completely out of the box with zero external keys needed, but seamlessly supports custom Google Gemini and Brave/Tavily keys when provided.

---

## Verification & Demo Verification

To verify the working demo:
1. Run `node test_e2e.mjs` to execute all 9 workflow steps automatically.
2. Start the application:
   - Server: `cd server && npm run dev` (Port 3001)
   - Client: `cd client && npm run dev` (Port 5173)
3. Open `http://localhost:5173` to test the pre-seeded CRISPR trial session or launch a new investigation using one of the pre-loaded student research kits!
