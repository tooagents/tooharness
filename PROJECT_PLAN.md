# TooHarness — Unified Input Accounting SaaS

## Concept

Single text box. Type anything. The agent classifies and routes:
- "today is raining" → diary entry
- "$20 uber" → transaction

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  READ/LIST PATH (no AI)                                     │
│  Frontend → FastAPI (business logic, CRUD) → DynamoDB       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NEW INPUT PATH (AI classification)                         │
│  Frontend → AgentCore (classify) → FastAPI (validate+write) │
│                  ↕                        ↓                 │
│            Memory (recall)            DynamoDB              │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| **Frontend** (React/TS, Amplify) | UI, display data, send input |
| **FastAPI** (FastAPI Cloud) | All CRUD, business logic, accounting rules, validation |
| **AgentCore** (Harness → Runtime) | NL classification, memory, smart routing |
| **MCP tools** (AgentCore Runtime) | Agent-specific capabilities (NOT data storage) |
| **DynamoDB** (AWS) | Data persistence |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript (Vite) |
| Frontend hosting | AWS Amplify |
| Backend | FastAPI (deployed to FastAPI Cloud) |
| Auth | IAM Identity Center |
| Agent | AgentCore Harness → Runtime |
| Memory | AgentCore Memory (SEMANTIC, USER_PREFERENCE) |
| MCP tools | AgentCore Runtime (`agentcore create mcp`) |
| Storage | DynamoDB (AWS) |
| Deploy (agent) | `agentcore` CLI (manual) |
| Deploy (backend) | `fastapi deploy` |

## Steps

### Step 1: React/TS Frontend [DONE]
- Single text input + submit
- Two-panel display (diary, transactions)
- Client-side classification placeholder (to be replaced by agent)

### Step 2: FastAPI Backend [DONE]
- FastAPI project with CRUD endpoints
- DynamoDB via boto3 (tables auto-created on startup)
- Deploy to FastAPI Cloud

### Step 3: Wire Frontend → FastAPI [DONE]
- Frontend calls FastAPI for read/list
- Frontend calls FastAPI for manual write (non-AI path)
- CRUD works end-to-end (frontend → FastAPI → DynamoDB)

### Step 5: AgentCore Agent + Memory + MCP [DONE]
- Harness with memory (SEMANTIC + USER_PREFERENCE)
- MCP runtime with save_entry tool (calls FastAPI)
- Gateway bridges harness → MCP runtime (required for IAM auth)
- System prompt: classify → call save_entry → confirm
- Full chain: Harness → Gateway → MCP → FastAPI Cloud → DynamoDB

### Step 6: Wire Frontend → Agent (for new input)
- Frontend sends natural language to AgentCore
- Agent classifies → calls MCP tool → persists → returns confirmation
- Replace client-side classification with agent

### Step 8: IAM Identity Center Auth
- Set up IAM Identity Center
- Frontend auth flow (SSO → temporary creds)
- Secure FastAPI + AgentCore endpoints

### Step 9: Polish & Extend
- Query support ("how much did I spend this week?")
- Memory-powered suggestions ("uber is usually transport")
- Full accounting logic (double-entry, COA, reports)

## Rules

- Step-by-step: confirm each step works before next
- AgentCore deploy: user runs `agentcore` CLI commands manually
- FastAPI deploy: `fastapi deploy`
- No CI/CD pipelines
- Keep each step minimal and working
