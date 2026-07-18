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

**A production-grade REST API backend powering SmartNoter — an AI platform that converts YouTube videos, audio files, PDFs, web pages, and raw text into intelligent summaries, quizzes, flashcards, and mind maps.**

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [API Modules](#-api-modules)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Setup](#-docker-setup)
- [Project Structure](#-project-structure)
- [Author](#-author)

---

## 🔍 Overview

SmartNoter is an intelligent note-taking and learning platform designed for students, professionals, and content creators. The backend is a **Node.js + TypeScript REST API** that orchestrates multiple AI pipelines to help users extract, summarize, quiz, and interact with knowledge from any content format — video, audio, PDF, URL, or plain text.

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

### Backend Core
| Technology | Purpose |
|---|---|
| **Node.js 20** | Runtime environment |
| **TypeScript 5.4** | Type-safe development |
| **Express.js 4** | REST API framework |
| **Mongoose 8** | MongoDB ODM |
| **Redis (ioredis)** | Caching & session management |

### AI & Machine Learning
| Technology | Purpose |
|---|---|
| **Google Gemini 2.5 Flash** | Primary LLM for summarization & generation |
| **LangChain + @langchain/google-genai** | RAG pipeline & AI chain orchestration |
| **AssemblyAI** | Audio speech-to-text transcription |
| **YouTube Transcript API** | YouTube caption extraction |

### Infrastructure & Tooling
| Technology | Purpose |
|---|---|
| **Firebase Admin SDK** | Google / Apple OAuth token verification |
| **Docker + Docker Compose** | Containerized deployment |
| **AWS S3 SDK** | Cloud file storage |
| **Multer** | Multipart file upload handling |
| **FFmpeg (fluent-ffmpeg)** | Audio/video processing |
| **Puppeteer** | Headless browser for web scraping |
| **Razorpay** | Payment gateway integration |
| **node-cron** | Scheduled jobs (e.g., daily credit resets) |
| **Joi** | Request body validation |
| **JWT** | Stateless session tokens |

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

### Content Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/summary` | Retrieve all user summaries |
| `GET` | `/history` | Get user activity history |
| `POST` | `/folders` | Create a new folder |
| `GET` | `/folders` | List all folders |
| `POST` | `/audioSummary` | Get audio version of a summary |

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

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ishit02422/SmartNoter-AI-based-Text-audio-video-summarazation-with-automated-quiz-genration.git
cd SmartNoter-AI-based-Text-audio-video-summarazation-with-automated-quiz-genration

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in your credentials (see Environment Variables section)

# 4. Place Firebase credentials
# Save your Firebase service account JSON as:
./firebase-admin.json.json

# 5. Start the development server
npm run watch
```

The server starts on **port 6001** by default.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=6001
COOKIE_SECRET=your_cookie_secret

# Database
MONGO_URI=mongodb+srv://your_mongo_connection_string

# Redis
REDIS_URL=redis://localhost:6379

# Google Gemini (comma-separated keys for rotation)
GOOGLE_API_KEY=key1,key2,key3

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=./firebase-admin.json.json

# AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your_bucket_name

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# JWT
JWT_SECRET=your_jwt_secret
```

> **Note:** Multiple Gemini API keys can be provided as a comma-separated list. The system auto-rotates between keys to avoid rate limits.

---

## 🐳 Docker Setup

Run the entire backend stack (API + Redis) with a single command:

```bash
# Build and start all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build

# Stop all services
docker-compose down
```

**Services started:**
| Service | Port |
|---|---|
| SmartNoter API | `6001` |
| Redis Cache | `13068` (mapped to internal `6379`) |

---

## 📁 Project Structure

```
src/
├── app.ts                        # Express app setup, middleware & route registration
├── server.ts                     # Server entry point
├── dbConnections.ts              # MongoDB connection
├── redis.ts                      # Redis client setup
├── llm.ts                        # Gemini LLM initialization
├── request.ts                    # Extended Express Request type
│
├── controllers/                  # Route handlers (one folder per feature)
│   ├── auth/                     # Firebase Google/Apple authentication
│   ├── user/                     # User profile & account management
│   ├── admin/                    # Admin-only operations
│   ├── generateSummaryFromYoutube/  # YouTube video summarization
│   ├── generateSummaryAudio/     # Audio file summarization
│   ├── generatedSummaryPDF/      # PDF summarization
│   ├── generatedSummaryFromWeb/  # Web URL summarization
│   ├── generateSummaryFromText/  # Plain text summarization
│   ├── quiz/                     # Quiz generation
│   ├── flashcard/                # Flashcard generation
│   ├── mindMap/                  # Mind map generation
│   ├── chatWithAI/               # RAG-based AI chat
│   ├── translate/                # Multi-language translation
│   ├── allSummary/               # Summary retrieval & management
│   ├── history/                  # User activity history
│   ├── folders/                  # Folder management
│   ├── playAudio/                # TTS audio playback
│   ├── payment/                  # Razorpay payment processing
│   ├── subscription/             # Subscription plan management
│   ├── rewards/                  # Credit rewards system
│   ├── rag/                      # RAG pipeline endpoints
│   └── ...
│
├── middleware/
│   ├── validateAuthIdToken.ts    # Firebase JWT verification middleware
│   └── checkCreditLimit.ts       # Credit-based rate limiting middleware
│
├── modules/                      # Database models & business logic
│   ├── user/                     # User schema & CRUD
│   ├── generatedSummary/         # Summary schema & queries
│   ├── image/                    # Image model
│   └── ...
│
├── helper/
│   └── firebase.ts               # Firebase Admin SDK initialization
│
├── routes/
│   └── summary.route.ts          # Direct YouTube summary route
│
└── types/                        # TypeScript type definitions
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 👤 Author

**Ishit Patel**

- GitHub: [@Ishit02422](https://github.com/Ishit02422)
- Project: [SmartNoter — AI Summarization Platform](https://github.com/Ishit02422/SmartNoter-AI-based-Text-audio-video-summarazation-with-automated-quiz-genration)

---

<div align="center">

Made with ❤️ using **Node.js**, **TypeScript**, **Google Gemini**, and **LangChain**

⭐ Star this repository if you found it helpful!

</div>
