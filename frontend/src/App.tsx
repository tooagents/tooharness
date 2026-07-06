import { useState, type FormEvent } from 'react'
import './App.css'

interface DiaryEntry {
  id: string
  text: string
  timestamp: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  timestamp: string
}

function classifyInput(input: string): { type: 'diary' | 'transaction'; data: DiaryEntry | Transaction } {
  const moneyMatch = input.match(/^\$?([\d.]+)\s+(.+)/)
  const id = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  if (moneyMatch) {
    return {
      type: 'transaction',
      data: { id, amount: parseFloat(moneyMatch[1]), description: moneyMatch[2], timestamp }
    }
  }

  return {
    type: 'diary',
    data: { id, text: input, timestamp } as DiaryEntry
  }
}

function App() {
  const [input, setInput] = useState('')
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const result = classifyInput(input.trim())

    if (result.type === 'diary') {
      setDiary(prev => [result.data as DiaryEntry, ...prev])
    } else {
      setTransactions(prev => [result.data as Transaction, ...prev])
    }

    setInput('')
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
        />
        <button type="submit">Send</button>
      </form>

      <div className="panels">
        <div className="panel">
          <h2>Diary</h2>
          {diary.length === 0 && <p className="empty">No entries yet</p>}
          {diary.map(entry => (
            <div key={entry.id} className="entry">
              <span className="entry-text">{entry.text}</span>
              <span className="entry-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Transactions</h2>
          {transactions.length === 0 && <p className="empty">No transactions yet</p>}
          {transactions.map(tx => (
            <div key={tx.id} className="entry">
              <span className="entry-text">${tx.amount.toFixed(2)} — {tx.description}</span>
              <span className="entry-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
