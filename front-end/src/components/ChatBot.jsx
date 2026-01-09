import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import axios from 'axios'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! How can I help?', sender: 'bot', time: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const msg = { id: messages.length + 1, text: input, sender: 'user', time: new Date() }
    setMessages(prev => [...prev, msg])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('http://localhost:7373/api/chat', { message: input })
      const reply = { id: messages.length + 2, text: res.data.reply, sender: 'bot', time: new Date() }
      setMessages(prev => [...prev, reply])
    } catch (err) {
      const error = { id: messages.length + 2, text: 'Error: ' + err.message, sender: 'bot', time: new Date() }
      setMessages(prev => [...prev, error])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-40"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 max-h-96">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <p className="text-sm text-blue-100">Gemini Powered</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs opacity-70">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {loading && <div className="text-center text-gray-500">Loading...</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="border-t p-3 flex gap-2 bg-white rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
