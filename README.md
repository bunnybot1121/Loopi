# BugHunt 🧠

> **The AI coding mentor that remembers why you fail — not just that you did.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bughunt1121.vercel.app-1D9E75?style=for-the-badge)](https://bughunt1121.vercel.app)
[![Built with Hindsight](https://img.shields.io/badge/Memory-Hindsight%20by%20Vectorize-534AB7?style=for-the-badge)](https://hindsight.vectorize.io)
[![Powered by Groq](https://img.shields.io/badge/LLM-Groq%20%2B%20Qwen3--32B-BA7517?style=for-the-badge)](https://groq.com)
[![Debugger](https://img.shields.io/badge/Debugger-Gemini%20AI-4285F4?style=for-the-badge)](https://ai.google.dev)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge)](https://nextjs.org)

---

## The Problem

Every coding platform treats you like a stranger every single session.

LeetCode doesn't know you keep failing recursion. HackerRank doesn't know you always miss null checks. They give you **Wrong Answer** — and nothing else. You waste hours on problems that aren't targeting your actual gaps.

**PatternMind fixes this.** It uses persistent memory to learn *how you think* — not just what you typed wrong — and uses that knowledge to generate targeted problems, deliver personalised coaching, and track your growth over time.

---

## What Makes It Different

| Every other platform | PatternMind |
|---|---|
| Forgets you every session | Remembers your full history via Hindsight |
| Says "Wrong Answer" | Says "This is the 3rd time you've missed the recursion base case" |
| Random problem selection | AI generates problems targeting your exact weak spot |
| No coaching | Socratic debug coach — Gemini analyzes your code and asks guiding questions |
| No progress metric | Interview Readiness Score powered by your memory |

---

## Features

### 🎯 Personalized Problem Generator
Every problem is generated fresh by AI based on your Hindsight memory. The moment you start a session, PatternMind reads your past errors, thinking patterns, and weak topics — then creates a challenge designed specifically for your gap.

```
"Generated because: you've missed recursion base cases in 2 of your last 3 sessions."
```

### 🧠 Cognitive Fingerprint
PatternMind doesn't just track errors — it detects the **thinking habit** behind them. Five patterns tracked across sessions:

- **Brute force first** — jumps to O(n²) without considering optimisation
- **Skips edge cases** — misses empty input, null, boundary conditions
- **Recursion avoidance** — rewrites recursive solutions unnecessarily
- **Off-by-one tendency** — loop boundary mistakes that keep repeating
- **Over-engineers** — writes complex solutions to simple problems

### 🦆 AI Debug Coach (Powered by Gemini)
When you submit code, **Gemini analyzes your code deeply** — reading the logic, identifying the bug, understanding the error pattern — and then responds in full Socratic mode. It never hands over the answer. It asks the one question that makes you see the bug yourself.

```
"What happens when your input array is empty? Have you traced through 
the loop when i = arr.length - 1?"
```

Gemini's code understanding goes beyond surface-level error messages — it reads your actual logic, understands what you were *trying* to do, and identifies where your thinking broke down. This feeds directly into the Hindsight memory write as a classified error type and thinking pattern.

### 📊 Error Fingerprint Dashboard
A full visualisation of everything Hindsight has learned — error heatmap (error types × languages), session progress timeline, pattern diagnosis, and the Interview Readiness Score.

### 🎯 Interview Readiness Score
One bold number that compresses your entire history into a single, immediately understandable metric. Updated after every session.

```
Readiness = (Solve Rate × 40%) + (Consistency × 25%) + (Difficulty Trend × 20%) + (Error Frequency × 15%)
```

### 💼 JD to Skill Gap Analyzer
Paste any job description. PatternMind cross-references it with your error history and generates a personalised 14-day prep plan targeting the exact overlap between what the role needs and where you're weakest.

### 📚 Memory-Linked Problem Bank
A curated problem bank where every card shows whether it matches your weak areas — pulled directly from Hindsight memory. AI generates additional targeted problems on demand.

---

## How Hindsight Memory Powers Everything

Hindsight is the thread connecting every feature. After every submission, PatternMind writes a memory entry:

```json
{
  "user_id": "user_abc",
  "error_type": "missing-base-case",
  "thinking_pattern": "recursion_avoidance",
  "language": "python",
  "topic": "trees",
  "difficulty": "medium",
  "solved": false,
  "session_number": 3,
  "timestamp": "2026-03-20T10:30:00Z"
}
```

Before generating the next challenge, PatternMind recalls:

```
top_3_error_types         → drives problem error category
dominant_thinking_pattern → drives AI feedback framing
weakest_topic             → drives problem topic selection
last_3_solve_rates        → drives difficulty adjustment
total_sessions            → drives readiness score calculation
```

Without Hindsight, this is just another coding chatbot. With it, it's a mentor.

---

## The Submission Flow

```
User submits code
       ↓
Gemini analyzes code + logic deeply
(reads structure, intent, and where thinking broke down)
       ↓
Groq classifies: error_type + thinking_pattern
       ↓
Hindsight writes memory entry
       ↓
Groq generates Socratic diagnosis referencing pattern count
       ↓
User sees: "3rd time this pattern appeared"
       ↓
Next session: Hindsight recalled → problem generated for that exact gap
```

---

## Demo

> **Session 1** — Generic problem, cold start. Memory starts recording.
>
> **Session 3** — AI says: *"Since you've struggled with off-by-one errors in arrays across 2 sessions, here's a problem built exactly for that pattern."*
>
> **Dashboard** — Readiness score: **68%**. Error fingerprint shows "Missing base case: 3×". Thinking pattern: "Skips edge cases under pressure."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Code Editor | Monaco Editor (VS Code engine) |
| Memory | **Hindsight Cloud by Vectorize** |
| LLM — Generation | Groq — `qwen/qwen3-32b` |
| LLM — Debugging | **Gemini AI** |
| Auth | Clerk |
| Database | Vercel Postgres |
| Deployment | Vercel |

---

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/patternmind.git
cd patternmind

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Groq — Problem generation + classification
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Gemini — Code debugging and analysis
GEMINI_API_KEY=your_gemini_api_key

# Hindsight Memory
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://ui.hindsight.vectorize.io

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxx

# Database
POSTGRES_URL=your_vercel_postgres_url
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
patternmind/
├── app/
│   ├── practice/          # Main 3-panel coding screen
│   ├── problems/          # Problem bank + AI generator
│   ├── dashboard/         # Error fingerprint + readiness score
│   └── api/
│       ├── submit/        # Gemini debug + Groq classify + write Hindsight
│       ├── challenge/     # Recall Hindsight + generate problem
│       ├── memory/        # Read user's Hindsight profile
│       └── jd-analyzer/   # JD → skill gap + prep plan
├── components/
│   ├── CodeEditor.tsx     # Monaco Editor
│   ├── MemoryPanel.tsx    # Live Hindsight sidebar ← demo showpiece
│   ├── FeedbackPanel.tsx  # Gemini debug response + Groq diagnosis
│   └── ReadinessScore.tsx # The big % number
└── lib/
    ├── hindsight.ts       # ALL memory read/write ← build this first
    ├── groq.ts            # Problem generation + pattern classification
    └── gemini.ts          # Code debugging + Socratic coaching
```

---

## How Gemini Is Used

Gemini handles the **deep code analysis** layer — the part that requires actually understanding what the code is doing, not just seeing an error message:

```typescript
// lib/gemini.ts
// Gemini reads the full code + problem description
// Returns: bug analysis, thinking pattern, and a Socratic question

const response = await gemini.generateContent(`
  You are a Socratic coding coach. Analyze this code submission.
  
  Problem: ${problemDescription}
  Language: ${language}
  Code: ${userCode}
  
  1. Identify exactly what is wrong
  2. Classify the thinking pattern behind the mistake
  3. Return ONE guiding question — never the solution
`);
```

Groq then takes the classified error type and thinking pattern from Gemini's analysis and writes it to Hindsight memory — ensuring every debug session contributes to the user's cognitive fingerprint.

---

## Hackathon

Built for the **AI Agents That Learn Using Hindsight** hackathon.

**Theme:** AI agents that use Hindsight memory to remember, recall, and improve over time.

**How PatternMind uses Hindsight:**
- Writes a structured memory entry after every single code submission
- Recalls full user profile before every problem generation
- Uses cross-session pattern detection to identify cognitive fingerprints
- Powers the Interview Readiness Score from accumulated session data
- Enables the "this is the Nth time" feedback line — impossible without persistent memory

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

MIT

---

<div align="center">

**PatternMind** — Built with [Hindsight](https://hindsight.vectorize.io) · [Groq](https://groq.com) · [Gemini](https://ai.google.dev) · [Next.js](https://nextjs.org)

*"The coding mentor that remembers why you fail — not just that you did."*

</div>
