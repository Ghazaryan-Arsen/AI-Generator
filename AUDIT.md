# AI Image Generator - Production Engineering Audit

## 1. Architecture Overview
The application is a full-stack AI Image Generator built with **React (Vite)** on the frontend and **Express (Node.js)** on the backend, using **TypeScript** throughout.

### API Flow (Step-by-Step)
1. **Request:** Frontend sends `{ prompt, style, aspectRatio }` to `POST /api/generate-image`.
2. **Validation:** Backend uses `express-validator` to verify the prompt.
3. **Job Initiation:** `JobController` creates a job via `JobService`.
4. **Immediate Response:** Backend returns `202 Accepted` with the `jobId` immediately.
5. **Background Processing:**
   - `JobService` calls `PromptService` to enhance the prompt.
   - `JobService` calls `HFService` to generate an image via Hugging Face Inference API.
   - `JobService` calls `StorageService` to save the resulting buffer to local disk.
6. **Polling:** Frontend polls `GET /api/job-status/:id` every 2 seconds using an exponential backoff strategy until completion.

## 2. Bottleneck Analysis & Root Causes
### The "Axios Timeout" Issue
- **Cause:** The frontend timeout was set to **10,000ms (10s)**. While the backend returns a response immediately after creating the job (usually < 100ms), the *initial* request can still time out if the backend is waking up (cold start), experiencing heavy load, or if the network is extremely slow.
- **Worse Case:** If the backend *didn't* use an async job system (which it actually does), a 10s timeout would be impossible for AI generation, which typically takes 15-30s.

### Architecture Weaknesses
- **In-Memory Job State:** Jobs are stored in a `Map`. If the server restarts, all pending/processing jobs are lost.
- **Local Storage:** Images are saved to `public/uploads`. This works for local dev and VPS, but fails on serverless platforms (Vercel/Render free tier) which have ephemeral filesystems.
- **No Concurrency Limit:** The backend starts an HF API call for every request immediately. A surge in users would lead to mass `429 Too Many Requests` from Hugging Face.
- **Basic Error Handling:** Most errors are caught and logged, but not handled through a centralized middleware, leading to inconsistent response structures on unexpected crashes.

## 3. Security & Scalability Issues
- **CORS:** Currently configured to allow `*`. This must be restricted to the production domain.
- **Prompt Injection:** Basic sanitization exists (stripping `<>`), but more robust filtering is needed for production.
- **Memory Leak Risk:** While there is a cleanup interval, the `MAX_JOBS` limit is small (100). For scale, this needs to move to a database (Redis/PostgreSQL).

## 4. Proposed Fixes (Implemented in this Refactor)
1. **Intelligent Timeouts:** Increased frontend timeout to 120s to handle edge cases.
2. **Async/Error Infrastructure:** Added `asyncHandler` and global `errorMiddleware` for rock-solid backend stability.
3. **Concurrency Control:** Implemented a job queue with a limit of 3 concurrent AI generation tasks in `JobService`.
4. **Buffer Validation:** Added logic to verify image buffer integrity (JPEG/PNG magic bytes) before storage.
5. **Toast Feedback:** Integrated a custom Toast notification system for real-time user feedback on generation success or failure.
