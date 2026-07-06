# TooHarness — Unified Input Accounting SaaS

## Concept

Single text box. Type anything. The agent classifies and routes:
- "today is raining" → diary entry
- "$20 uber" → transaction

## Architecture

```
┌─────────────────────────────────────┐
│  React/TS Frontend (Amplify)        │
│  Single input + history view        │
│  Auth: IAM Identity Center          │
└──────────────────┬──────────────────┘
                   ▼
┌─────────────────────────────────────┐
│  AgentCore Harness → Runtime        │
│  • Classifies input                 │
│  • Routes to tools                  │
│  • Memory: SEMANTIC + USER_PREF     │
└──────────────────┬──────────────────┘
                   ▼
┌─────────────────────────────────────┐
│  MCP Server (AgentCore Runtime)     │
│  • write_diary                      │
│  • write_transaction                │
│  • query_entries (later)            │
└──────────────────┬──────────────────┘
                   ▼
┌─────────────────────────────────────┐
│  DynamoDB                           │
│  • diary_entries table              │
│  • transactions table               │
└─────────────────────────────────────┘
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript |
| Auth | IAM Identity Center |
| Agent | AgentCore Harness → Runtime |
| Memory | AgentCore Memory (SEMANTIC, USER_PREFERENCE) |
| Tools | MCP Server in AgentCore Runtime (`agentcore create mcp`) |
| Storage | DynamoDB |
| Hosting | AWS (Amplify for frontend, AgentCore for backend) |
| Deploy | `agentcore` CLI (manual, no CI/CD) |

## Steps

### Step 1: React/TS Frontend
- Scaffold concise React + TypeScript app
- Single text input + submit
- Display classified results (diary entries, transactions)
- No auth yet — add later

### Step 2: DynamoDB Tables
- Create `diary_entries` table (pk: user_id, sk: timestamp)
- Create `transactions` table (pk: user_id, sk: timestamp)
- Basic schema, keep it simple

### Step 3: MCP Server
- `agentcore create mcp` — create MCP server project
- Implement tools: `write_diary`, `write_transaction`
- Tools write to DynamoDB
- Deploy with `agentcore deploy`

### Step 4: Agent Harness + Memory
- `agentcore create` — create harness project
- System prompt: classify input → diary or transaction
- Attach MCP server as tool source
- Configure memory (SEMANTIC + USER_PREFERENCE strategies)
- Deploy with `agentcore deploy`

### Step 5: Connect Frontend → Agent
- Frontend calls AgentCore Runtime (invoke harness)
- Wire up streaming responses
- Display classification + confirmation

### Step 6: IAM Identity Center Auth
- Set up IAM Identity Center
- Frontend auth flow (SSO → temporary creds)
- Secure all endpoints

### Step 7: Polish & Extend
- Query support ("how much did I spend this week?")
- Memory-powered suggestions ("uber is usually transport")
- Categories, tags, search

## Rules

- Step-by-step: confirm each step works before next
- AgentCore deploy: user runs `agentcore` CLI commands manually
- No CI/CD pipelines
- Keep each step minimal and working
