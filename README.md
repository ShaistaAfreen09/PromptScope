# PromptScope Enterprise SaaS Platform 🚀

PromptScope is a highly polished, commercial-grade AI Prompt Intelligence, Analytics, and Optimization platform designed for engineering, product, and AI research teams. It enables teams to analyze prompt quality, track token consumption, calculate real-time model costs, grade instructions alignment, and optimize prompt architecture for maximum performance and minimum overhead.

## Key Core Architectures
- **Synthetic Nature Design System**: Beautiful custom dashboard styled with Sage Green, Warm Sand Gold, and Cream White.
- **Dual Container Multi-Service Pipeline**: A modern TypeScript-based frontend/Express Gateway cooperating with a Python FastAPI backend, backed by PostgreSQL and ChromaDB vector search.
- **Enterprise Security Hardening**: Built-in rate limiting, AES masked key encryption, detailed operational logging, and strict CORS boundaries.
- **Telemetry Observability**: Advanced instrumentation including live health, readiness, and liveness endpoints.

---

## 🛠️ Rapid Container Deployment (Docker Compose)

The easiest way to stand up PromptScope along with all dependencies is using our isolated container network structures.

### Development Environment Setup
To build and execute all core components locally with hot asset mapping:

```bash
docker-compose up --build
```

This starts the following isolated local cluster:
- **Frontend/Gateway Node**: `http://localhost:3000` (Node/Express serving built React SPA & Proxy Routes)
- **FastAPI Core Service**: `http://localhost:8080` (FastAPI core endpoint engine)
- **PostgreSQL Database**: `localhost:5432` (Persistent storage)
- **ChromaDB Node**: `localhost:8000` (Semantic vector embeddings storage)

### Production Deployment Setup
To initialize resource limits, network constraints, secure restarts, and structured logging metrics:

```bash
docker-compose -f docker-compose.production.yml up --build -d
```

---

## 🔧 Environment Configuration

To configure operational parameters, duplicate the provided example files and populate them with appropriate credentials.

### Frontend Service Configuration (`frontend.env.example`)
Configure Firebase parameters for authentication synchronization and Google Gemini API keys for prompt engineering scoring models:

```bash
cp frontend.env.example .env
```

### Backend Service Configuration (`backend.env.example`)
Configure private credentials, encryption parameters, and PostgreSQL database URLs:

```bash
cp backend.env.example ./backend/.env
```

---

## 🧪 Automated Testing Strategy

PromptScope features a thorough testing foundation covering all major layers of the software lifecycle.

### 1. Frontend Client Testing (Vitest & RTL)
Tests core interactive views, loading indicators, secure key registration, and input validation rules:

```bash
# Execute local Vitest tests
npm run test
```

### 2. Backend Service Testing (Pytest)
Tests FastAPI operational routers, request validations, and authorization boundaries:

```bash
# Execute Pytest suites inside Python environment
pytest tests/backend/
```

### 3. AI scoring Heuristics Testing
Tests embedding vector similarity metrics and qualitative grading formulas:

```bash
pytest tests/ai_engine/
```

---

## 📊 System Observability & Health Indicators

PromptScope provides comprehensive telemetry for production cluster monitoring:

- `/health` - Returns systemic usage statistics (uptime, memory allocation, platform context).
- `/readiness` - Performs structural check on connected dependency responsiveness (Gemini, Database).
- `/liveness` - Simple, lightweight router returned instantly for ping loops.

---

## 🛡️ Security & Regulatory Compliance

- **Key Encrypt-at-Rest**: Stored third-party API credentials are encrypted via AES Base64 masks before touching persistence tables.
- **Internal Network Isolation**: Database and vector servers are locked inside separate network domains (`internal: true`) and cannot be pinged externally.
- **GDPR Protocols**: Built-in endpoints supporting immediate database cleansing of user account metrics on delete requests.

For detailed guidelines, please refer to:
- `ARCHITECTURE.md` (System structures & workflows)
- `SECURITY.md` (Regulatory and cryptographic controls)
- `API_REFERENCE.md` (Full endpoint schemas)
