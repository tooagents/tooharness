const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
const USER_ID = "default-user" // placeholder until auth is wired

export interface DiaryEntry {
  user_id: string
  timestamp: string
  text: string
}

export interface Transaction {
  user_id: string
  timestamp: string
  amount: string
  description: string
  category?: string
}

export async function createDiaryEntry(text: string): Promise<DiaryEntry> {
  const res = await fetch(`${API_URL}/diary/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID, text }),
  })
  return res.json()
}

export async function listDiaryEntries(): Promise<DiaryEntry[]> {
  const res = await fetch(`${API_URL}/diary/${USER_ID}`)
  return res.json()
}

export async function createTransaction(amount: number, description: string, category?: string): Promise<Transaction> {
  const res = await fetch(`${API_URL}/transactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID, amount, description, category }),
  })
  return res.json()
}

export async function listTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_URL}/transactions/${USER_ID}`)
  return res.json()
}

export interface AgentResponse {
  message: string
  session_id: string
}

export async function classifyWithAgent(text: string, sessionId?: string): Promise<AgentResponse> {
  const res = await fetch(`${API_URL}/agent/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id: sessionId }),
  })
  return res.json()
}
