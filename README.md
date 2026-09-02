# 🧠 SmartNoter — AI-Based Text, Audio & Video Summarization with Automated Quiz Generation

<div align="center">

![SmartNoter Banner](https://img.shields.io/badge/SmartNoter-AI%20Powered-blueviolet?style=for-the-badge&logo=openai&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white)

**A production-grade full-stack AI platform that converts YouTube videos, audio files, PDFs, web pages, and raw text into intelligent summaries, quizzes, flashcards, and mind maps.**

### 🌐 Live Demo

[![Live App](https://img.shields.io/badge/🚀%20Live%20App-Click%20Here-brightgreen?style=for-the-badge)](https://smartnoter-frontend.onrender.com)
![Backend](https://img.shields.io/badge/⚙️%20Backend-Deployed%20on%20Render-blue?style=for-the-badge)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [API Modules](#-api-modules)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Setup](#-docker-setup)
- [Author](#-author)

---

## 🔍 Overview

SmartNoter is an intelligent note-taking and learning platform designed for students, professionals, and content creators. It is a **full-stack application** consisting of:

- **Frontend (Live)** → [https://smartnoter-frontend.onrender.com](https://smartnoter-frontend.onrender.com)
- **Backend** — Node.js + TypeScript REST API, deployed on Render (private)

The system uses **Google Gemini 2.5 Flash** as the primary LLM, backed by **LangChain** for RAG (Retrieval-Augmented Generation) pipelines, **AssemblyAI** for audio transcription, **MongoDB** for persistence, and **Redis** for caching and rate limiting.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🎥 **YouTube Summarization** | Fetches transcript from any YouTube video and generates a structured AI summary |
| 🎙️ **Audio Summarization** | Transcribes uploaded audio files (AssemblyAI) and generates smart summaries |
| 📄 **PDF Summarization** | Extracts text from PDFs and summarizes the content using Gemini |
| 🌐 **Web Page Summarization** | Scrapes and summarizes any public URL using Cheerio + Puppeteer |
| 📝 **Text Summarization** | Accepts raw text input and produces AI-generated structured notes |
| 🧩 **Quiz Generation** | Auto-generates multiple-choice quizzes from any summarized content |
| 🃏 **Flashcard Generation** | Creates study flashcards from summaries for active recall learning |
| 🗺️ **Mind Map Generation** | Builds structured mind maps from key concepts in the content |
| 💬 **Chat With AI** | Allows users to have contextual conversations about their summaries (RAG) |
| 🌍 **Multi-language Translation** | Translates summaries into 100+ languages via LangChain + Gemini |
| 🔊 **Audio Playback** | Converts text summaries to listenable audio via TTS |
| 📂 **Folders** | Organize and manage saved summaries into folders |
| 🏆 **Rewards & Credits System** | Credit-based usage model with daily reset via cron jobs |
| 💳 **Subscriptions & Payments** | Razorpay-integrated payment and subscription management |
| 👤 **User Management** | Full profile management including bio, avatar, profession, and account deletion |
| 🛡️ **Firebase Auth** | Secure Google & Apple OAuth login via Firebase ID token validation |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 20 + TypeScript 5.4** | Runtime & type-safe development |
| **Express.js 4** | REST API framework |
| **Mongoose 8** | MongoDB ODM |
| **Redis (ioredis)** | Caching & session management |
| **Google Gemini 2.5 Flash** | Primary LLM for summarization & generation |
| **LangChain + @langchain/google-genai** | RAG pipeline & AI chain orchestration |
| **AssemblyAI** | Audio speech-to-text transcription |
| **YouTube Transcript API** | YouTube caption extraction |
| **Firebase Admin SDK** | Google / Apple OAuth token verification |
| **Docker + Docker Compose** | Containerized deployment |
| **AWS S3 SDK** | Cloud file storage |
| **FFmpeg (fluent-ffmpeg)** | Audio/video processing |
| **Puppeteer** | Headless browser for web scraping |
| **Razorpay** | Payment gateway integration |
| **node-cron** | Scheduled jobs (daily credit resets) |

### Frontend
| Technology | Purpose |
|---|---|
| **React + TypeScript** | UI framework |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | API communication |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SmartNoter Backend                    │
│                   Express.js + TypeScript                │
├─────────────────────────────────────────────────────────┤
│  Auth Middleware (Firebase Token Validation)             │
│  Credit Middleware (Usage Rate Limiting)                 │
├──────────────┬──────────────────┬───────────────────────┤
│  AI Pipelines│   File Storage   │   User & Auth          │
│  ────────────│   ─────────────  │   ─────────────────   │
│  Gemini LLM  │   AWS S3 Upload  │   Firebase Auth        │
│  LangChain   │   Multer Upload  │   Google / Apple OAuth │
│  AssemblyAI  │   FFmpeg Process │   JWT Sessions         │
├──────────────┴──────────────────┴───────────────────────┤
│                     MongoDB (Mongoose)                   │
│  Users │ Summaries │ Quizzes │ Flashcards │ History      │
├─────────────────────────────────────────────────────────┤
│                    Redis Cache                           │
│  Session Caching │ Credit State │ Rate Limiting          │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
SmartNoter/
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/                    # Application pages
│   │   ├── api.ts                    # API calls
│   │   └── ...
│   └── tailwind.config.js
│
└── videoToText_backend-main/         # Node.js + TypeScript backend
    ├── src/
    │   ├── app.ts                    # Express app setup & route registration
    │   ├── server.ts                 # Server entry point (port 6001)
    │   ├── dbConnections.ts          # MongoDB connection
    │   ├── redis.ts                  # Redis client setup
    │   ├── llm.ts                    # Gemini LLM initialization
    │   │
    │   ├── controllers/              # Route handlers (one folder per feature)
    │   │   ├── auth/                 # Firebase Google/Apple authentication
    │   │   ├── user/                 # User profile & account management
    │   │   ├── generateSummaryFromYoutube/  # YouTube summarization
    │   │   ├── generateSummaryAudio/        # Audio summarization
    │   │   ├── generatedSummaryPDF/         # PDF summarization
    │   │   ├── generatedSummaryFromWeb/     # Web URL summarization
    │   │   ├── generateSummaryFromText/     # Text summarization
    │   │   ├── quiz/                        # Quiz generation
    │   │   ├── flashcard/                   # Flashcard generation
    │   │   ├── mindMap/                     # Mind map generation
    │   │   ├── chatWithAI/                  # RAG-based AI chat
    │   │   ├── translate/                   # Multi-language translation
    │   │   ├── payment/                     # Razorpay payment processing
    │   │   ├── subscription/                # Subscription management
    │   │   └── rewards/                     # Credit rewards system
    │   │
    │   ├── middleware/
    │   │   ├── validateAuthIdToken.ts       # Firebase JWT verification
    │   │   └── checkCreditLimit.ts          # Credit-based rate limiting
    │   │
    │   └── modules/                  # Database schemas & business logic
    │
    ├── Dockerfile
    └── docker-compose.yml
```

---

## 📡 API Modules

### Authentication — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/loginWithGoogle` | Sign in with Google via Firebase |
| `POST` | `/auth/loginWithApple` | Sign in with Apple via Firebase |
| `POST` | `/auth/logout` | Logout and invalidate session |
| `POST` | `/auth/guest` | Create a guest user session |
| `POST` | `/auth/session` | Refresh/validate existing session |

### Summarization — (Credit-Gated)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/generatedSummaryFromVideo` | Summarize a YouTube video |
| `POST` | `/generatedSummaryFromPDF` | Summarize an uploaded PDF |
| `POST` | `/generatedSummaryFromAudio` | Summarize uploaded audio |
| `POST` | `/generatedSummaryWeb` | Summarize a web page URL |
| `POST` | `/generateSummaryText` | Summarize raw plain text |

### AI Learning Tools — (Credit-Gated)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/quiz` | Generate a quiz from summary |
| `POST` | `/flashcard` | Generate flashcards from summary |
| `POST` | `/mindmap` | Generate a mind map from summary |
| `POST` | `/chatWithAi` | RAG-powered Q&A on summaries |
| `POST` | `/translateSummary` | Translate summary to any language |

### User & Profile — `/user`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user` | Get authenticated user profile |
| `PUT` | `/user` | Update user account details |
| `PUT` | `/user/profile` | Update profile (bio, avatar, DOB, etc.) |
| `DELETE` | `/user/:id` | Delete user account |

### Payments & Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payment` | Initiate a Razorpay payment |
| `GET` | `/subscription` | Get current subscription plan |
| `POST` | `/subscription` | Activate/upgrade subscription |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **MongoDB** instance (local or Atlas)
- **Redis** server
- **Firebase** project with service account credentials
- **Google Gemini API** key(s)
- **AssemblyAI** API key (for audio)
- **AWS S3** bucket (for file storage)

### Backend Setup

```bash
# Navigate to backend folder
cd videoToText_backend-main

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your credentials

# Start development server
npm run watch
```

### Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

The backend runs on **port 6001** by default.

---


> **Note:** Multiple Gemini API keys can be provided as a comma-separated list. The system auto-rotates between keys to avoid rate limits.

---

## 🐳 Docker Setup

```bash
cd videoToText_backend-main

# Build and start all services (API + Redis)
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down
```

| Service | Port |
|---|---|
| SmartNoter API | `6001` |
| Redis Cache | `13068` |

---

## 👤 Author

**Ishit Patel**

- GitHub: [@Ishit02422](https://github.com/Ishit02422)
- Project: [SmartNoter on GitHub](https://github.com/Ishit02422/SmartNoter-AI-based-Text-audio-video-summarazation-with-automated-quiz-genration)

---

<div align="center">

Made with ❤️ using **Node.js**, **TypeScript**, **React**, **Google Gemini**, and **LangChain**

⭐ Star this repository if you found it helpful!

</div>
