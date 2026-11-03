# AI Career Compass — Frontend

A modern, responsive, and intuitive web application for AI-powered career discovery, skill gap evaluation, structured learning roadmaps, career comparison, and personalized advisory guidance.

---

## 🚀 Live API Integration

The frontend is fully integrated with the **AI Career Compass API** (`https://carrer-ai-pearl.vercel.app/api`).

### Connected Endpoints

| # | Feature | Endpoint | Method | Payload |
|---|---|---|---|---|
| 1 | **Career Recommendations** | `/api/career/recommend` | `POST` | `{ skills: string[], interests: string[], education: string, experience_level: string }` |
| 2 | **Skill Gap Analysis** | `/api/skill/gap-analysis` | `POST` | `{ current_skills: string[], target_career: string }` |
| 3 | **Learning Roadmap** | `/api/roadmap/generate` | `POST` | `{ target_career: string, current_skills: string[], timeline_months?: number }` |
| 4 | **Career Comparison** | `/api/guidance/compare` | `POST` | `{ careers: string[] }` |
| 5 | **AI Career Guidance** | `/api/guidance/advice` | `POST` | `{ question: string, context?: { skills?: string[], education?: string, interests?: string[] } }` |

---

## 🛠️ Architecture & Features

- **Centralized API Service (`src/services/api.js`)**: Encapsulates all backend calls with standard HTTP headers (`Content-Type: application/json`, `Accept: application/json`), structured `ApiError` class, network error diagnostics, and response validation.
- **Configurable Base URL**: Configured via `VITE_API_BASE_URL` in `.env`, with a live default of `https://carrer-ai-pearl.vercel.app/api`. Users can also customize or reset the API URL directly inside the application Settings modal.
- **Defensive Response Normalization**: Robust parsing handles variations in API payload wrappers (`data`, `result`, nested response objects) without ever failing or showing mock data.
- **Cross-Module Workflows**: Seamlessly carry recommended career targets into the **Skill Gap Analysis** and **Learning Roadmap** generators with a single click.
- **Dark / Light Theme & Accessibility**: Includes persistent theme selection and `prefers-reduced-motion` compliance.

---

## 📦 Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already preconfigured):
```env
VITE_API_BASE_URL=https://carrer-ai-pearl.vercel.app/api
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
