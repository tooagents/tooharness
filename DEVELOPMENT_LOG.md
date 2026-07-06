# TooHarness Development Log

## 2026-07-06: Initial Build Session

### Concept
Single text box SaaS accounting app. Type anything — AI classifies as diary entry or transaction and persists it.

### Key Decisions Made

#### Architecture
- **Frontend**: React + TypeScript (Vite), will deploy to AWS Amplify
- **Backend**: FastAPI, deployed to FastAPI Cloud (fastapicloud.com, beta)
- **Agent**: AgentCore Harness → Runtime (managed, config-driven)
- **Memory**: AgentCore Memory (SEMANTIC + USER_PREFERENCE strategies, 365-day expiry)
- **MCP Tools**: AgentCore Runtime (`agentcore add agent` with MCP protocol)
- **Gateway**: Required bridge between Harness and MCP Runtime (IAM auth requirement)
- **Storage**: DynamoDB (AWS), accessed via boto3 from FastAPI
- **Auth**: IAM Identity Center (not yet implemented)
- **Deploy**: `agentcore` CLI manual (no CI/CD), `fastapi deploy` for backend

#### Why These Choices
- **FastAPI Cloud over Lambda/ECS**: Simple deploy (`fastapi deploy`), normal dev experience, scales. Backend will have complex accounting logic over time.
- **DynamoDB over Postgres**: User preference. Supabase/Neon considered unreliable. FastAPI connects cross-network via boto3 + env vars.
- **AgentCore Harness over Runtime (code-based)**: Harness = config/definition layer that deploys INTO Runtime. Same system, not separate. User wants to practice harness + memory patterns.
- **Gateway required**: Runtimes only support AWS_IAM or CUSTOM_JWT auth (no NONE). Harness `remote_mcp` can't sign requests. Gateway with `authorizerType: NONE` acts as proxy, handling IAM to runtime internally.
- **MCP for agent tools, NOT for CRUD**: MCP tools are agent-specific actions. All CRUD goes through FastAPI directly.

#### Layer Responsibilities
| Layer | Does |
|-------|------|
| Frontend | UI, display, send input to backend |
| FastAPI | CRUD, business logic, proxy to AgentCore |
| AgentCore Harness | NL classification, memory |
| MCP Runtime | Agent tool execution (save_entry → calls FastAPI) |
| Gateway | Auth bridge between harness and MCP runtime |
| DynamoDB | Data persistence |

### Steps Completed

#### Step 1: React/TS Frontend
- Vite + React + TypeScript
- Single input box, two-panel display (diary, transactions)
- `frontend/` directory

#### Step 2: FastAPI Backend
- CRUD endpoints: POST/GET diary, POST/GET transactions
- DynamoDB via boto3, tables auto-created on startup
- CORS enabled
- `backend/` directory
- Deployed to: https://t4harness.fastapicloud.dev

#### Step 3: Wire Frontend → FastAPI
- Frontend calls FastAPI for all read/write
- End-to-end CRUD confirmed working

#### Step 4: AgentCore Setup (via CLI)
- `agentcore create` → project `myharness/` with harness `TooHarness`
- Model: `global.anthropic.claude-sonnet-4-6` (Bedrock)
- Memory: managed mode, SEMANTIC + USER_PREFERENCE strategies
- Deployed and tested classification: `agentcore invoke --harness TooHarness "$20 uber"` → correct JSON

#### Step 5: MCP + Gateway
- `agentcore add agent` (MCP protocol) → `TooMcp` runtime
- Implemented `save_entry` tool in `app/TooMcp/main.py`
- Tool calls FastAPI via httpx to persist diary/transactions
- Gateway `TooGateway` (protocolType: None, httpRuntime target) bridges harness → MCP
- Full chain working: Harness → Gateway → MCP → FastAPI Cloud → DynamoDB
- Tested: "$20 uber" → "Saved transaction: $20 uber (transport)"

#### Step 6: Wire Frontend → Agent
- Added `POST /agent/classify` endpoint to FastAPI (proxies to AgentCore via boto3)
- Frontend sends text to this endpoint instead of local regex classification
- Agent response displayed in UI
- Session ID maintained for memory continuity

### Technical Details

#### AgentCore Project Structure
```
myharness/
├── AGENTS.md                    # AI context file
├── agentcore/
│   ├── agentcore.json           # Main config (runtimes, memories, gateways, harnesses)
│   ├── aws-targets.json         # Deploy target (us-east-1)
│   ├── .env.local               # Secrets
│   ├── .cli/deployed-state.json # Deployed resource ARNs
│   └── cdk/                     # CDK infra (auto-generated)
└── app/
    ├── TooHarness/
    │   ├── harness.json         # Harness config (model, tools, memory)
    │   └── system-prompt.md     # Agent system prompt
    └── TooMcp/
        ├── main.py              # MCP server with save_entry tool
        └── pyproject.toml       # Dependencies (mcp, httpx)
```

#### Key ARNs
- Harness: `arn:aws:bedrock-agentcore:us-east-1:822206589627:harness/myharness_TooHarness-VXRrfMABCV`
- MCP Runtime: `arn:aws:bedrock-agentcore:us-east-1:822206589627:runtime/myharness_TooMcp-qWspNBDJr4`
- Gateway: `arn:aws:bedrock-agentcore:us-east-1:822206589627:gateway/myharness-toogateway-hwfszrnwm0`
- Memory: `arn:aws:bedrock-agentcore:us-east-1:822206589627:memory/myharness_TooHarnessMemory-CAmOZIAhOz`

#### Gateway Lesson Learned
- AgentCore Runtimes ONLY support `AWS_IAM` or `CUSTOM_JWT` auth (no NONE)
- Harness `remote_mcp` tool type connects via URL but can't do IAM signing
- Solution: Gateway with `authorizerType: NONE` + `httpRuntime` target pointing to MCP runtime
- Gateway protocol must be `"None"` (not `"MCP"`) when using `httpRuntime` targets
- Harness references gateway via `agentcore_gateway` tool type with full ARN

#### DynamoDB Tables
- `tooharness_diary_entries` (pk: user_id, sk: timestamp)
- `tooharness_transactions` (pk: user_id, sk: timestamp)
- Pay-per-request billing mode
- No schema migration needed (schemaless items)

### Remaining Steps
- Step 7: IAM Identity Center Auth
- Step 8: Polish & Extend (queries, memory suggestions, full accounting logic)

### Environment
- AWS Region: us-east-1
- AWS Account: 822206589627
- FastAPI Cloud: https://t4harness.fastapicloud.dev
- AgentCore CLI for all agent/MCP/harness deploys
- `fastapi deploy` for backend
- Frontend not yet deployed (local dev only)
