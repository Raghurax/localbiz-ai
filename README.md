# LocalBiz AI - Production-Quality AI Marketing Assistant for Small Businesses

> **Problem Statement Addressed**:
> *'Create an assistant that helps small businesses create marketing content in local languages, using synthetic data generation to overcome the lack of real-world training data.'*

**LocalBiz AI** is a production-grade full-stack web application designed as a localized marketing copilot for regional small business owners. It empowers local shops (clothing boutiques, bakeries, jewelers, salons, electronics stores) to create high-converting multi-channel marketing campaigns using voice or text in regional languages—initially **Telugu** and **English** (architected for Hindi, Tamil, Kannada, Marathi, Malayalam).

---

## Key Features

### 1. Conversational AI Marketing Assistant with Speech-to-Campaign
- **Telugu & English Voice Input**: Integrated Web Speech API (te-IN, en-IN, en-US) with waveform feedback, editable live transcripts, and graceful text fallback.
- **Structured Parameter Extraction**: Automatically parses unstructured / code-mixed queries (e.g., 'Dasara sale ki 30 percent discount undi. Telugu lo Instagram and WhatsApp campaign create cheyyi.') into clean JSON specifications while preserving discount numbers, prices, brand names, and dates.
- **Smart Context Awareness**: Inquires only about missing critical campaign parameters, relying on the store's **Business Profile** for known facts.

### 2. Multi-Channel Campaign Generation
Generates complete promotional packages in seconds:
- **Telugu Instagram Captions**: Culturally resonant hooks, emojis, store location, and local hashtags (#HyderabadShopping, #DasaraOffers).
- **WhatsApp Broadcast Messages**: Ready-to-blast mobile formatting with bold bullet points, contact numbers, and direct CTA links.
- **Poster Copy**: High-contrast, bilingual headline and badge concepts.
- **15-30s Viral Reel Scripts**: Scene-by-scene visual cues, on-screen text overlays, and Telugu audio voiceover cues.
- **1-Click Actions**: Copy, edit, regenerate, change tone, translate, export ZIP, and publish.

### 3. Core Engineering Pillar: Synthetic Data Engine & Quality Control (QC) Studio
- **Synthetic Permutation Engine**: Generates diverse scenarios across categories (Clothing, Bakeries, Jewellery, Electronics, Salons), offers (percentage, flat, BOGO), and audiences (students, homemakers, working professionals).
- **8-Point Automated Quality Control (QC)**:
  - Missing field validation
  - Duplicate detection via MD5 hash indexing
  - Strict numeric offer & discount preservation checks
  - Brand and product consistency
  - Platform suitability (hashtags for Instagram, mobile formatting for WhatsApp)
  - Regional language consistency (Telugu script & dialect markers)
  - Safety & predatory marketing claim filter
  - Token repetition penalty
- **Quality Status & Analytics**: Classifies every example as VALID, NEEDS REVIEW, or REJECTED, providing real-time quality scores, rejection reasons, and coverage statistics.

### 4. Visual Media & Video Storyboard Pipeline
- **Marketing Poster Canvas**: High-resolution 1080x1080 graphic generator with Indian festive crimson/gold themes, discount badges, typography, and reference asset blending.
- **15-30s Promotional Video Reel**: Template-driven storyboard pipeline with animated scene sequences, duration stamps, visual cues, and Telugu audio voiceovers.

### 5. Publish Center & Safety Guardrails
- **Official Account Hub**: Integrates Instagram Professional accounts (Meta Graph API) and WhatsApp Business with strict token vaulting (zero password collection).
- **Pre-Publish Safety Confirmation**: Prevents unintended posts by requiring explicit user confirmation previews with media, caption, tags, and recipient account details.
- **Transparent WhatsApp Broadcasting**: Generates official Click-to-Chat deep links without deceptive claims of status automation.

### 6. Full Campaign ZIP Exporter
- Downloads complete campaign packages bundled with metadata JSON, individual .txt assets, and summary markdown documentation.

---

## Pre-Configured Demo Scenario

- **Business**: Sri Lakshmi Fashion Store
- **Category**: Clothing & Ethnic Wear
- **Languages**: Telugu (te) & English (en)
- **Location**: KPHB Colony, Hyderabad & Benz Circle, Vijayawada
- **Occasion**: Dasara Festive Sale
- **Offer**: 30% OFF
- **Target Audience**: College students and young adults
- **Prompt**: 'Dasara sale ki 30 percent discount undi. Telugu lo Instagram and WhatsApp campaign create cheyyi.'

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0 ORM, SQLite / PostgreSQL ready.
- **Security & Auth**: JWT Bearer tokens, salted cryptographic password hashing, tenant data isolation on all queries (user_id, business_id).
- **Media Engine**: Pillow (PIL) high-res graphic canvas, JSON video storyboard manifest generator.

---

## Running Locally

### 1. Start Both Servers (One-Click)
`powershell
.\start_servers.ps1
`

### 2. Manual Start

**Backend**:
`ash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
`
API Documentation: http://127.0.0.1:8000/docs

**Frontend**:
`ash
cd frontend
npm run dev
`
Application URL: http://127.0.0.1:5173

### 3. Automated Test Suite
`ash
cd backend
python -m pytest test_all_features.py test_api.py -p no:cacheprovider
`
