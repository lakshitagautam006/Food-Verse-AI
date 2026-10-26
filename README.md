# Food Verse AI – Multimodal Food Intelligence Agent

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Groq Cloud AI](https://img.shields.io/badge/Groq-Cloud_AI_LPU-F55036.svg?style=flat)](https://console.groq.com)
[![Pytest](https://img.shields.io/badge/Pytest-14%20Passed-brightgreen.svg?style=flat&logo=pytest)](https://pytest.org)

> **SkillWallet Portfolio Project**: An AI/ML engineering fresher portfolio project demonstrating multimodal computer vision, prompt engineering with strict JSON schemas, nutritional estimation, food safety ethics, and responsive modern frontend engineering. Powered by ultra-fast Groq LPU inference (`qwen/qwen3.8-27b` for Vision, `openai/gpt-oss-120b` for Text).

---

## 1. Project Overview

**Food Verse AI** is a lightweight, full-stack multimodal agent designed to solve everyday culinary, nutritional, and sanitation challenges. By coupling ultra-low-latency cloud inference via the official **Groq Python SDK** (`qwen/qwen3.8-27b` Vision & `openai/gpt-oss-120b` Text) with a structured FastAPI backend and a responsive React frontend, Food Verse AI delivers instant food recognition, portion-calibrated nutritional estimation, visual produce freshness inspection, restaurant dining environment observation, zero-waste recipe synthesis, and personalized macro meal planning.

### Why This Project Stands Out in an AI/ML Fresher Portfolio
1. **Ultra-Fast Cloud Inference (2–3s)**: Leverages Groq's LPUs (Language Processing Units) for lightning-fast multimodal inference, avoiding local GPU/PyTorch overhead on low-RAM machines (< 8 GB RAM).
2. **Deterministic Structured JSON Output**: Employs Groq's native `response_format={"type": "json_object"}` combined with strict Pydantic schemas, eliminating parsing hallucinations.
3. **Responsible AI & Food Safety Ethics**: Implements explicit medical, freshness, and regulatory disclaimers, recognizing the boundary between visual observation and clinical/laboratory testing.
4. **Client-Side Image Preprocessing**: Client and server-side downscaling (LANCZOS to 1024px) minimizes cloud payload size and latency.
5. **Production-Ready Visual Design**: Handcrafted warm cream (`#FAF8F5`) and deep forest green (`#1B4332`) design system with accessible contrast, zero bloated CSS frameworks, and informative loading/empty/error states.

---

## 2. Core Functional Modules

| # | Module | Input Modality | Model | Core Capabilities & Ethical Guardrails |
|---|---|---|---|---|
| **1** | **Food Recognition & Nutrition Estimation** | Image (JPEG, PNG, WEBP) | `qwen/qwen3.8-27b` (Vision) | Identifies meals, assesses visual confidence, estimates serving sizes, calculates calories, and breaks down protein, carbs, fats, fiber, sugar, and sodium. Clearly labeled as *algorithmic estimates only*. |
| **2** | **Food Freshness & Visible Spoilage Observation** | Image (Produce, Leftovers) | `qwen/qwen3.8-27b` (Vision) | Scans for visible signs of wilting, discoloration, skin tautness, bruising, and surface mold. Provides shelf-life storage guidance. *Ethical guardrail: notes that images cannot detect microscopic pathogens.* |
| **3** | **Restaurant Hygiene & Dining Observations** | Image (Dining Room, Buffet, Kitchen) | `qwen/qwen3.8-27b` (Vision) | Observes observable sanitation factors (food covering, stainless steel cleanliness, clutter). Compares positive practices against potential concern areas. *Ethical guardrail: clearly disclaims regulatory health inspection equivalence.* |
| **4** | **Smart Cooking Assistant & Recipe Recommendations** | Image or Text | `qwen/qwen3.8-27b` (Image) / `openai/gpt-oss-120b` (Text) | Dual-input mode: snap pantry/refrigerator ingredients or type them. Recommends 2-3 creative recipes tailored to dietary preferences (Vegetarian, Vegan, Keto, etc.), prep times, and cuisine styles. |
| **5** | **Personalized Multimodal Meal Planner** | Structured Form | `openai/gpt-oss-120b` / `qwen/qwen3.8-27b` (Text) | Generates comprehensive 1-day, 3-day, or 7-day nutritional schedules with target macro distributions, daily calorie goals, meal-by-meal recipes, batch cooking tips, and an interactive categorized grocery checklist. |

---

## 3. System Architecture & Tech Stack

```
                                  +------------------------------------+
                                  |    User Browser / React + Vite     |
                                  |  Warm Cream & Forest Green Theme   |
                                  +-----------------+------------------+
                                                    | HTTP REST / Proxy
                                                    v
                                  +------------------------------------+
                                  |      FastAPI Backend Server        |
                                  |         (Python 3.12)              |
                                  +--------+------------------+--------+
                                           |                  |
                       +-------------------+                  +-------------------+
                       |                                                          |
                       v                                                          v
        +------------------------------+                          +------------------------------+
        |   Image Utils & Validation   |                          |    Pydantic Schema Engine    |
        | - MIME validation            |                          | - Strict typing              |
        | - 5 MB file size limit       |                          | - Range checks (calories)    |
        | - Downsampling (max 1024px)  |                          | - Response serialization     |
        +--------------+---------------+                          +--------------+---------------+
                       |                                                         |
                       +-----------------------+  +------------------------------+
                                               |  |
                                               v  v
                                  +------------------------------------+
                                  |       Groq Service (Official SDK)  |
                                  | - Vision: qwen/qwen3.8-27b         |
                                  | - Text:   openai/gpt-oss-120b      |
                                  | - Response: json_object            |
                                  | - Fallback & Rate Limit Handling   |
                                  +-----------------+------------------+
                                                    | Secure HTTPS
                                                    v
                                  +------------------------------------+
                                  |         Groq Cloud AI LPU          |
                                  +------------------------------------+
```

### Technology Breakdown
- **Frontend**: React 18, Vite 5, JavaScript (ES6+), Vanilla CSS variables.
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Python-dotenv, Pillow, Groq SDK.
- **AI Inference**: Official Groq Python SDK (`qwen/qwen3.8-27b` for Vision, `openai/gpt-oss-120b` for Text).
- **Testing**: PyTest, FastAPI TestClient.

---

## 4. Directory Structure

```
food-verse-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry & CORS middleware
│   │   ├── config.py                # Environment configuration & GROQ_API_KEY loader
│   │   ├── schemas.py               # Pydantic data schemas & response validation
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini_service.py     # Groq SDK integration, prompts & auto-fallback
│   │   │   └── image_utils.py        # Image resizing, MIME check, and base64 encoding
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── nutrition.py         # POST /api/nutrition/analyze
│   │       ├── freshness.py         # POST /api/freshness/analyze
│   │       ├── hygiene.py           # POST /api/hygiene/analyze
│   │       ├── recipes.py           # POST /api/recipes/generate-from-[image|text]
│   │       └── meal_planner.py      # POST /api/meal-planner/generate
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py              # 14 automated unit & integration tests
│   ├── requirements.txt             # Lightweight Python dependencies (including groq)
│   ├── .env.example                 # Environment template
│   └── .env                         # Local secrets (not committed)
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # App branding & live Groq status indicator
│   │   │   ├── DisclaimerBanner.jsx # Ethical AI disclaimer notice
│   │   │   ├── ImageUploader.jsx    # Drag-and-drop uploader with live preview
│   │   │   ├── KeySetupModal.jsx    # Interactive Groq key setup guide
│   │   │   ├── Icons.jsx            # Custom lightweight SVG icons
│   │   │   ├── NutritionModule.jsx  # Module 1 UI: Nutrition & Macro bars
│   │   │   ├── FreshnessModule.jsx  # Module 2 UI: Freshness & Spoilage
│   │   │   ├── HygieneModule.jsx    # Module 3 UI: Restaurant Hygiene
│   │   │   ├── CookingModule.jsx    # Module 4 UI: Recipe recommendations
│   │   │   └── MealPlannerModule.jsx# Module 5 UI: Meal planner & grocery list
│   │   ├── api.js                   # Frontend fetch client
│   │   ├── index.css                # Warm cream & forest green design system
│   │   ├── App.jsx                  # Main tab navigation shell
│   │   └── main.jsx                 # React root mount
│   ├── index.html                   # HTML entry
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Dev server configuration & proxy
├── package.json                     # Root workspace scripts
├── .gitignore                       # Repository ignore rules
└── README.md                        # Documentation
```

---

## 5. API Endpoints Reference

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/` | Root API metadata & documentation link | None |
| `GET` | `/api/health` | Backend status & Groq API key configuration state | None |
| `POST` | `/api/nutrition/analyze` | Food identification and nutritional estimation | Multipart `file` (Image) |
| `POST` | `/api/freshness/analyze` | Visual freshness and spoilage signs observation | Multipart `file` (Image) |
| `POST` | `/api/hygiene/analyze` | Restaurant & dining environment sanitation observation | Multipart `file` (Image) |
| `POST` | `/api/recipes/generate-from-image` | Recipes generated from photo of ingredients | Multipart `file`, form fields |
| `POST` | `/api/recipes/generate-from-text` | Recipes generated from ingredients list | JSON (`RecipeTextRequest`) |
| `POST` | `/api/meal-planner/generate` | Personalized daily/weekly meal plan & grocery list | JSON (`MealPlannerRequest`) |

Interactive Swagger documentation is available at **`http://127.0.0.1:8000/docs`** whenever the backend is running.

---

## 6. Windows Setup & Run Instructions

### Step 1: Prerequisites
- Python 3.10+ (Verified on Python 3.12)
- Node.js 18+ (Verified on Node.js v24)
- A free Groq API Key from [Groq Console](https://console.groq.com/keys)

---

### Step 2: Configure Backend Environment
1. Open PowerShell or Command Prompt.
2. Navigate to the backend directory:
   ```powershell
   cd "c:\Users\Dell\Documents\Food verse AI\food-verse-ai\backend"
   ```
3. Copy `.env.example` to `.env` (if not already done):
   ```powershell
   copy .env.example .env
   ```
4. Open `.env` in Notepad or VS Code:
   ```powershell
   notepad .env
   ```
5. Replace `your_groq_api_key_here` with your actual key from Groq Console:
   ```ini
   GROQ_API_KEY=gsk_...
   GROQ_VISION_MODEL=qwen/qwen3.8-27b
   GROQ_TEXT_MODEL=openai/gpt-oss-120b
   HOST=127.0.0.1
   PORT=8000
   ```
6. Save and close the file.

---

### Step 3: Install Backend Dependencies & Run Tests
1. Install requirements:
   ```powershell
   python -m pip install -r requirements.txt
   ```
2. Run the automated Pytest suite to verify all 12 tests pass:
   ```powershell
   python -m pytest tests -v
   ```
3. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will be running at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

---

### Step 4: Start Frontend Development Server
1. Open a **second** terminal window.
2. Navigate to the frontend directory:
   ```powershell
   cd "c:\Users\Dell\Documents\Food verse AI\food-verse-ai\frontend"
   ```
3. Install frontend dependencies (if not already done):
   ```powershell
   npm install
   ```
4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
5. Open your browser and navigate to **`http://localhost:5173`**.

---

## 7. How to Explain This Project in an Interview

As an AI Engineer fresher, explain the project by highlighting your engineering decisions:

1. **Ultra-Low Latency Inference with Groq LPUs**:
   > *"To deliver near-instant responses without GPU costs or heavy local weights, I integrated Groq's LPUs via the official Groq SDK. Vision queries execute on `qwen/qwen3.8-27b` in ~2.5 seconds, while text queries utilize `openai/gpt-oss-120b` for deep recipe and macro reasoning."*

2. **Deterministic Structured JSON Output**:
   > *"Rather than relying on unstructured text from LLMs, I enforced Groq's native `response_format={'type': 'json_object'}` paired with strict Pydantic schemas in FastAPI. This ensures that every vision inference returns validated numeric values for calories, macronutrients, and categorical freshness ratings."*

3. **Resource-Aware Architecture (< 8 GB RAM)**:
   > *"To guarantee high responsiveness on resource-constrained devices, I avoided heavy local models like PyTorch or YOLO. Instead, I offloaded inference to Groq's cloud models and implemented client/server image downsampling (max 1024px with Lanczos filter) to minimize bandwidth, latency, and RAM usage."*

4. **Responsible AI & Food Safety Engineering**:
   > *"Computer vision cannot detect invisible bacteria like Salmonella or verify internal refrigeration temperatures. I built strict ethical guardrails into both prompt templates and UI disclaimers so users understand these are visual observations, not laboratory or regulatory certifications."*

5. **Zero-Friction Testing & Ergonomics**:
   > *"Every module includes quick-test samples that synthesize valid in-memory test images in canvas. An evaluator or recruiter can test all 5 modules immediately with one click without needing to source image files."*

---

## License
MIT License. Created for the SkillWallet AI Engineering Portfolio.
