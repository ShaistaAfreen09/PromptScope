# Enterprise Security & Compliance Hardening: PromptScope

PromptScope enforces high-grade commercial security protocols designed to prevent unauthorized access, secure sensitive third-party keys, and maintain rigorous data privacy standards.

---

## 🔐 1. Cryptographic Controls & Key Masking (AES-256)

To securely manage third-party API keys (e.g., Gemini, OpenAI, Anthropic) in our dashboard:

- **Key Encryption-at-Rest**: API keys are encrypted immediately upon registration using **AES-256-GCM** with a master `ENCRYPTION_KEY` configured purely server-side.
- **Key Masking-in-Transit**: Raw secret keys are never returned to the frontend. The API only exposes masked keys using standard commercial formats (e.g., `gem-*****************5kL9` or `sk-*****************38a1`).
- **Secret Separation**: Master encryption keys and service credentials are kept out of code repos, referenced solely through environment files.

---

## 🎛️ 2. Rate Limiting, Input Sanitization & API Shielding

To protect PromptScope nodes from denial-of-service attempts and code injection:

- **Gateway Rate Limiting**: The Nginx proxy enforces rate limiting with an isolated buffer zone (`limit_req_zone` with a burst threshold of 20 and a rate limit of 10 requests/sec).
- **Backend Rate Limiting Middleware**: FastAPI incorporates `ProcessTimeAndRateLimitMiddleware` to monitor request frequency per user token, returning status `429 Too Many Requests` when thresholds are breached.
- **Input Sanitization**: Raw prompt payloads undergo strict schema validation using **Pydantic** on Python models and runtime regex checks to strip SQL/NoSQL injection scripts and malicious HTML tags.

---

## 🎟️ 3. Authentication & Session Validation

- **Firebase ID Token Verification**: All protected client endpoints enforce Firebase session token verification. Each request must carry a valid `Authorization: Bearer <ID_TOKEN>` header.
- **Server-Side Token Verification**: The FastAPI backend validates the cryptographically signed JWTs using Google public keys and certificates, ensuring that user context is secure and authentic.
- **Session Lifecycles**: Standard token lifespans are restricted to 3600 seconds, requiring automated renewal via refresh tokens.

---

## ⚖️ 4. GDPR Compliance & Privacy Frameworks

PromptScope is engineered to support regional and international data protection laws:

### User Data Rights (Article 15-20 GDPR)
- **Data Portability (Right to Export)**: Users can download their complete historical transaction metrics, reports, and templates at any time using the CSV/JSON stream exporting endpoints (`/api/reports/download/:id`).
- **Right to Be Forgotten (Right to Erasure)**: When a user deletes their account from the settings panel, PromptScope triggers cascading database deletes, completely cleansing historical reports, API keys, and workspace links from our PostgreSQL clusters.

### Sensitive Data Scrubbing
- **HIPAA Regex Filters**: Standard template creations trigger Regex filters designed to scan, mask, and scrub protected health information (PHI) and personally identifiable information (PII) before submission to multi-model execution nodes.
