# BugHunt — The Coding Mentor That Remembers

<div align="center">

**AI-powered coding practice platform that learns your patterns, tracks your mistakes, and generates targeted challenges to help you improve.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)

</div>

---

## What is BugHunt?

BugHunt is not just another LeetCode clone. It's a **cognitive coding mentor** that:

- 🧠 **Remembers your mistakes** — Using Hindsight AI memory, it tracks your error patterns across sessions
- 🎯 **Generates targeted challenges** — AI creates problems that specifically target your weak areas
- 🧬 **Builds your Mistake DNA** — A visual heatmap of your coding patterns across languages and difficulty levels
- 📊 **Tracks real progress** — Dashboard with real data: solve rates, error fingerprints, topic distribution

## Features

| Feature | Description |
|---------|-------------|
| **Practice Mode** | AI-generated coding challenges with live code editor (Monaco) |
| **Bug Analysis** | Inline analysis panel explaining *why* your code failed and *how* to fix it |
| **Mistake DNA** | Visual heatmap showing error patterns across languages × error types |
| **Smart Dashboard** | Real-time stats computed from your actual session history |
| **Skill Gap Analyzer** | Paste a job description to see how your skills match up |
| **Settings** | Choose preferred languages and default difficulty level |
| **Problems Bank** | Browse, filter, and search through static + AI-generated problems |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Auth:** Clerk (`@clerk/nextjs`)
- **AI Memory:** Hindsight API (Vectorize)
- **AI Generation:** Groq (LLaMA 3)
- **Code Execution:** Judge0 API
- **Styling:** Vanilla CSS (Neobrutalist design system)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/bunnybot1121/Loopi.git
cd Loopi/patternmind

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (Clerk, Hindsight, Groq, Judge0)

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `HINDSIGHT_BASE_URL` | Hindsight API base URL |
| `HINDSIGHT_API_KEY` | Hindsight API key |
| `GROQ_API_KEY` | Groq API key for AI problem generation |
| `JUDGE0_API_URL` | Judge0 API endpoint for code execution |
| `JUDGE0_API_KEY` | Judge0 API key |

## Project Structure

```
patternmind/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Main dashboard with analytics
│   ├── practice/         # Code editor + challenge view
│   ├── problems/         # Problem bank with filters
│   ├── dna/              # Mistake DNA visualization
│   ├── settings/         # Language & difficulty preferences
│   └── api/              # API routes (challenge, memory, etc.)
├── components/           # Reusable UI components
│   ├── NavBar.tsx
│   ├── CodeEditor.tsx
│   ├── ProblemCard.tsx
│   └── BugAnalysisPanel.tsx
├── lib/                  # Core logic
│   ├── groq.ts           # AI problem generation
│   ├── hindsight.ts      # Memory & profile management
│   ├── judge0.ts         # Code execution
│   └── problems.ts       # Static problem bank
└── types/                # TypeScript type definitions
```

## Design System

BugHunt uses a **Neobrutalist** design language:
- Bold 3px borders with offset box shadows
- Bebas Neue for display headings
- Space Mono for all body/UI text
- Accent colors: Cyan `#00E8C6`, Yellow `#F5C518`, Pink `#FF4EB8`, Coral `#FF5252`

---

<div align="center">
  <strong>Built with 🧠 by BugHunt Team</strong>
</div>