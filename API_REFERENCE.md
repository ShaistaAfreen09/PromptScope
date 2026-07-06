# Enterprise API Reference Manual: PromptScope

This guide provides structured reference material for PromptScope's production endpoints.

---

## 🔑 Authentication Sync & Credentials

### 1. Retrieve Vaulted API Keys
Exposes a list of currently vaulted and masked API credentials.

- **Endpoint**: `GET /api/keys`
- **Headers**: `Authorization: Bearer <ID_TOKEN>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "keys": [
    {
      "id": "key-gemini-1",
      "provider": "Google Gemini",
      "maskedKey": "gem-*****************5kL9",
      "isActive": true,
      "lastValidatedAt": "2026-06-23T16:16:00Z",
      "createdAt": "2026-06-21T12:00:00Z"
    }
  ]
}
```

### 2. Vault New API Key
Encrypts and stores a new platform credential.

- **Endpoint**: `POST /api/keys`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "provider": "OpenAI GPT-4",
  "rawKey": "sk-your-secret-api-key-here"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "key": {
    "id": "key-12345",
    "provider": "OpenAI GPT-4",
    "maskedKey": "ope-*****************7yH2",
    "isActive": true,
    "lastValidatedAt": "2026-06-23T17:16:00Z",
    "createdAt": "2026-06-23T17:16:00Z"
  }
}
```

---

## ⚡ Prompt Optimization & Core AI Execution

### 1. Analyze and Score Prompt
Grades structural attributes of a prompt, estimates token count, and provides suggestions.

- **Endpoint**: `POST /api/analyze-prompt`
- **Body**:
```json
{
  "promptText": "Write some Python code",
  "systemInstruction": "You are a professional software engineer."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "promptText": "Write some Python code",
    "timestamp": "2026-06-23T17:16:00Z",
    "scores": {
      "score": 75,
      "clarity": { "score": 85, "feedback": "Clear immediate objective." },
      "specificity": { "score": 60, "feedback": "Could define formatting rules." },
      "context": { "score": 80, "feedback": "Excellent system instructions setup." },
      "ambiguity": { "score": 70, "feedback": "Add negative constraints." }
    },
    "tokenCount": 24,
    "estimatedCost": 0.0000018,
    "suggestions": ["Add response formatting definitions."],
    "latencyMs": 142
  }
}
```

### 2. Optimize Prompt Text
Tunes a prompt using expert templates and professional constraint injectors.

- **Endpoint**: `POST /api/optimize-prompt`
- **Body**:
```json
{
  "promptText": "Write some Python code",
  "systemInstruction": "You are an assistant.",
  "targetGoal": "Increase code efficiency and safety"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "originalPrompt": "Write some Python code",
    "optimizedPrompt": "Adopt the persona of a senior computer scientist...",
    "explanation": "### Enhancements:\n1. Persona defined...\n2. Output structured...",
    "metricShifts": {
      "clarityChange": 15,
      "specificityChange": 28,
      "overallChange": 22
    },
    "latencyMs": 195
  }
}
```

### 3. Cross-Model Execution Sandbox
Invokes multiple LLMs sequentially to compare latency, costs, and responses.

- **Endpoint**: `POST /api/execute-llm`
- **Body**:
```json
{
  "modelId": "claude-3-5-sonnet",
  "promptText": "How far is the moon?",
  "systemInstruction": "Answer briefly."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "modelId": "claude-3-5-sonnet",
    "modelName": "Claude 3.5 Sonnet (Anthropic)",
    "responseText": "The average distance to the Moon is 384,400 km.",
    "latencyMs": 412,
    "tokenUsage": {
      "prompt": 14,
      "completion": 18,
      "total": 32
    },
    "estimatedCostUsd": 0.000312,
    "alignmentScore": 98,
    "readabilityGrade": "General Reader (Grade 7-9)"
  }
}
```

---

## 📈 Reports & Audit Logs

### 1. Generate Custom Report
Aggregates performance matrices into downloadable static files.

- **Endpoint**: `POST /api/reports/generate`
- **Body**:
```json
{
  "title": "Model Speed Audit",
  "reportType": "model_benchmark",
  "format": "csv"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "report": {
    "id": "rep-555",
    "title": "Model Speed Audit",
    "reportType": "model_benchmark",
    "format": "csv",
    "createdAt": "2026-06-23T17:16:00Z",
    "data": []
  }
}
```

### 2. Stream Report Download
Downloads a generated report as a file attachment (CSV/JSON).

- **Endpoint**: `GET /api/reports/download/:id`
- **Headers**: `Accept: text/csv` or `Accept: application/json`
- **Response `200 OK`**: Raw CSV content or raw JSON object attached as file download.
