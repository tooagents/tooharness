import { useState, useEffect, type FormEvent } from 'react'
import './App.css'
import {
  classifyWithAgent,
  listDiaryEntries,
  listTransactions,
  type DiaryEntry,
  type Transaction,
} from './api'

function App() {
  const [input, setInput] = useState('')
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [lastMessage, setLastMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()

  useEffect(() => {
    listDiaryEntries().then(setDiary)
    listTransactions().then(setTransactions)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)

    const response = await classifyWithAgent(input.trim(), sessionId)
    setLastMessage(response.message)
    setSessionId(response.session_id)

    // Refresh lists from DB
    const [d, t] = await Promise.all([listDiaryEntries(), listTransactions()])
    setDiary(d)
    setTransactions(t)

    setInput('')
    setLoading(false)
  }

  return (
    <div className="app">
      <header>
        <h1>TooHarness</h1>
        <p className="subtitle">Type anything. We'll figure it out.</p>
      </header>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='"today is raining" or "$20 uber"'
          autoFocus
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>

      {lastMessage && (
        <p className="agent-response">{lastMessage}</p>
      )}

      <div className="panels">
        <div className="panel">
          <h2>Diary</h2>
          {diary.length === 0 && <p className="empty">No entries yet</p>}
          {diary.map(entry => (
            <div key={entry.timestamp} className="entry">
              <span className="entry-text">{entry.text}</span>
              <span className="entry-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Transactions</h2>
          {transactions.length === 0 && <p className="empty">No transactions yet</p>}
          {transactions.map(tx => (
            <div key={tx.timestamp} className="entry">
              <span className="entry-text">${parseFloat(tx.amount).toFixed(2)} — {tx.description}</span>
              <span className="entry-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
