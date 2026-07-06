# System Architecture & Topology: PromptScope

PromptScope utilizes a high-performance, resilient, multi-tier system topology engineered to separate presentation concerns from CPU-intensive AI tasks, securing sensitive client information.

---

## 🗺️ System Topology Diagram

The following structured schema represents the operational flow of data from external client browsers through the ingress proxy gateway to isolated internal services:

```text
               [ Public Web Ingress ]
                         │
                         ▼ (HTTPS / Port 443)
                  ┌──────────────┐
                  │  Nginx Proxy │ (SSL, Security Headers, Rate Limiting)
                  └──────┬───────┘
                         │
         ┌───────────────┴───────────────┐
         ▼ (Port 3000)                   ▼ (Port 8000)
┌──────────────────┐            ┌──────────────────┐
│  Frontend Node   │            │   FastAPI Core   │
│ (Vite React SPA  │            │ (Uvicorn / Guni) │
│ & Express Proxy) │            └────────┬─────────┘
└────────┬─────────┘                     │
         │ (Firebase Auth Sync)          ├────────────────────────┐
         ▼                               ▼                        ▼
┌──────────────────┐            ┌──────────────────┐     ┌──────────────────┐
│  Firebase Auth   │            │    PostgreSQL    │     │     ChromaDB     │
│ (OAuth Gateway)  │            │ (User Meta / DB) │     │  (Vector Embed)  │
└──────────────────┘            └──────────────────┘     └──────────────────┘
                                (Isolated Network)       (Isolated Network)
```

---

## ⚙️ Component Decoupling & Core Modules

### 1. Presentation & Gateway Layer (Frontend Node)
- **Engine**: Node.js v22 + Express v4 + Vite + React 19.
- **Role**: Serves optimized client-side static assets (JavaScript, CSS, fonts).
- **Proxy Gateway**: Acts as a lightweight proxy and first-party API layer for immediate client interactions, shielding the primary API servers.
- **Authentication Sync**: Validates token exchanges and initial sessions using Firebase Client SDKs.

### 2. High-Performance Core Engine (FastAPI Backend)
- **Engine**: Python v3.11 + FastAPI + SQL Alchemy AsyncPG + Alembic.
- **Role**: Coordinates computationally complex algorithms, executes database transactions, performs API credentials verification, and handles high-throughput operations.
- **Worker Configuration**: Powered by Uvicorn managing multiple background processes with graceful connection pooling.

### 3. Structural Storage Engine (PostgreSQL Database)
- **Engine**: PostgreSQL v15.
- **Role**: Retains user workspaces, security logs, report history, prompt templates, and team structures.
- **Security**: Bound within a private database network (`internal: true`). Only accessible by the FastAPI container.

### 4. Vector Similarity Store (ChromaDB)
- **Engine**: Chroma Vector Database.
- **Role**: Manages normalized floating-point semantic embeddings for prompt similarity comparisons and quality scoring.
- **Security**: Completely isolated inside internal Docker networks.

---

## 🔄 Interaction and Request Lifecycles

### Sequence: Prompt Scoring & Assessment Flow

1. **Client Request**: The client writes a prompt and clicks "Analyze".
2. **Gateway Ingress**: The Nginx Reverse Proxy intercepts the request, checks IP rate limits, and directs it to the Express Server.
3. **Internal Auth Check**: The Express Server validates the Firebase ID Token in the request header.
4. **Backend Ingress**: Express delegates the query to the Python FastAPI backend.
5. **AI Extraction**: The FastAPI service generates embedding vectors of the prompt and matches them against existing ones in ChromaDB via cosine distance.
6. **Telemetry & Scoring**: Heuristics models scoring Clarity, Specificity, Context, and Ambiguity are executed.
7. **Audit & Log**: The transaction metrics (token count, estimated cost, speed) are written asynchronously to PostgreSQL and logged.
8. **Responsive UI Update**: The JSON response is returned back to the UI, rendering elegant, responsive charts and improvement suggestion lists.
