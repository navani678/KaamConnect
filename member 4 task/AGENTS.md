# Rules for any AI agent working on KaamConnect AI

- This is a 4-person project. The user will tell you which member they are (Member 1/2/3/4).
- Work ONLY on that member's tasks and files, as defined in docs/ and IMPLEMENTATION_PLAN.md.
- Never modify files owned by another member. If a change is needed there, stop and tell the user.
- Follow docs/api-contract.md EXACTLY (paths, field names, response envelope, status codes).
- Follow docs/data-models.md EXACTLY (field names, enums).
- Response envelope: success -> { "success": true, "data": ... }; error -> { "success": false, "error": { "code": "...", "message": "...", "fields": {...} } }.
- All coordinates are GeoJSON order: [longitude, latitude].
- Distances are in kilometres. Currency is INR (₹), stored as integers.
- Code style: ES modules, async/await, 2-space indent, no unused code, small functions, comments for non-obvious logic.
- Validate every request body with zod. Never trust client input.
- Never hard-code secrets. Read from process.env / import.meta.env.
- Before finishing a task: run the app/tests, fix errors, and summarise what changed.
