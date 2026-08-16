import { CheckCheck, Flag, ImagePlus, LoaderCircle, LockKeyhole, MessageCircle, Send, ShieldOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../api/client'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { initials, timeAgo } from '../utils/format'

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin

export default function ChatsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chats, setChats] = useState(null)
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState('')
  const [connectionState, setConnectionState] = useState('connecting')
  const [otherOnline, setOtherOnline] = useState(false)
  const [error, setError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportDescription, setReportDescription] = useState('')
  const socketRef = useRef(null)
  const activeChatRef = useRef(id || null)
  const joinedChatRef = useRef(null)
  const otherUserRef = useRef(null)
  const messageScrollerRef = useRef(null)
  const endRef = useRef(null)
  const typingTimer = useRef(null)
  const typingSent = useRef(false)

  const other = selected?.participants?.find((participant) => participant && String(participant._id) !== String(user._id))
  const otherUserId = String(other?._id || '')

  const loadChats = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/chats')
      const nextChats = Array.isArray(data.chats) ? data.chats : []
      setChats(nextChats)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const receiveMessage = useCallback((message) => {
    const messageChatId = String(message.chat?._id || message.chat || '')
    setChats((current) => {
      if (!Array.isArray(current)) return current
      const conversation = current.find((entry) => String(entry._id) === messageChatId)
      if (!conversation) return current
      const updated = { ...conversation, lastMessage: message, updatedAt: message.createdAt }
      return [updated, ...current.filter((entry) => String(entry._id) !== messageChatId)]
    })
    if (messageChatId !== String(activeChatRef.current || '')) return
    setMessages((current) => current.some((entry) => entry._id === message._id) ? current : [...current, message])
    const senderId = String(message.sender?._id || message.sender || '')
    if (senderId !== String(user._id) && document.visibilityState === 'visible') {
      api.patch(`/chats/${messageChatId}/read`).catch(() => {})
    }
  }, [user._id])

  useEffect(() => {
    activeChatRef.current = id || null
  }, [id])

  useEffect(() => {
    otherUserRef.current = otherUserId || null
  }, [otherUserId])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      timeout: 10000,
    })
    socketRef.current = socket

    const joinActiveChat = () => {
      setConnectionState('connected')
      const chatId = activeChatRef.current
      if (!chatId) return
      socket.emit('chat:join', chatId, (result) => {
        if (result?.success) {
          joinedChatRef.current = chatId
          setOtherOnline(Boolean(result.otherOnline))
        }
        else if (result?.message) toast.error(result.message)
      })
    }
    const handleDisconnect = () => {
      joinedChatRef.current = null
      setConnectionState('reconnecting')
      setOtherOnline(false)
    }
    const handleConnectError = () => setConnectionState('offline')
    const handleTypingStart = ({ chatId, userId, name }) => {
      if (String(chatId) === String(activeChatRef.current) && String(userId) !== String(user._id)) {
        setTyping(`${name} is typing...`)
      }
    }
    const handleTypingStop = ({ chatId, userId }) => {
      if (String(chatId) === String(activeChatRef.current) && String(userId) !== String(user._id)) setTyping('')
    }
    const handleChatStatus = ({ chatId, status, blockedBy }) => {
      if (String(chatId) !== String(activeChatRef.current)) return
      setSelected((current) => current ? { ...current, status, blockedBy } : current)
      setTyping('')
    }
    const handlePresence = ({ userId, online }) => {
      if (String(userId) === String(otherUserRef.current || '')) setOtherOnline(Boolean(online))
    }
    const handleMessagesRead = ({ chatId, userId }) => {
      if (String(chatId) !== String(activeChatRef.current || '')) return
      setMessages((current) => current.map((message) => {
        const readBy = Array.isArray(message.readBy) ? message.readBy : []
        if (readBy.some((reader) => String(reader?._id || reader) === String(userId))) return message
        return { ...message, readBy: [...readBy, userId] }
      }))
    }
    const handleUnreadChanged = () => loadChats()

    socket.on('connect', joinActiveChat)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('message:new', receiveMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('chat:status', handleChatStatus)
    socket.on('presence:update', handlePresence)
    socket.on('messages:read', handleMessagesRead)
    socket.on('chat:unread-changed', handleUnreadChanged)

    return () => {
      clearTimeout(typingTimer.current)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [loadChats, receiveMessage, user._id])

  useEffect(() => {
    const socket = socketRef.current
    const previousChatId = joinedChatRef.current
    if (previousChatId && String(previousChatId) !== String(id || '')) {
      socket?.emit('chat:leave', previousChatId)
      joinedChatRef.current = null
    }

    setTyping('')
    typingSent.current = false
    clearTimeout(typingTimer.current)

    if (!id) {
      setSelected(null)
      setMessages([])
      return undefined
    }

    let cancelled = false
    setSelected(null)
    setMessages([])

    Promise.all([api.get(`/chats/${id}`), api.get(`/chats/${id}/messages`)]).then(([chatResult, messageResult]) => {
      if (cancelled) return
      setSelected(chatResult.data.chat)
      setMessages(Array.isArray(messageResult.data.messages) ? messageResult.data.messages : [])
      if (socket?.connected) {
        socket.emit('chat:join', id, (result) => {
          if (result?.success) {
            joinedChatRef.current = id
            setOtherOnline(Boolean(result.otherOnline))
          }
          else if (result?.message) toast.error(result.message)
        })
      }
      api.patch(`/chats/${id}/read`).catch(() => {})
    }).catch((err) => {
      if (!cancelled) toast.error(err.message)
    })

    return () => {
      cancelled = true
      socket?.emit('typing:stop', { chatId: id })
      socket?.emit('chat:leave', id)
      if (String(joinedChatRef.current) === String(id)) joinedChatRef.current = null
    }
  }, [id])

  useEffect(() => {
    const markVisibleMessagesRead = () => {
      if (document.visibilityState === 'visible' && id) api.patch(`/chats/${id}/read`).catch(() => {})
    }
    document.addEventListener('visibilitychange', markVisibleMessagesRead)
    return () => document.removeEventListener('visibilitychange', markVisibleMessagesRead)
  }, [id])

  useEffect(() => {
    const scroller = messageScrollerRef.current
    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const blockerId = String(selected?.blockedBy?._id || selected?.blockedBy || '')
  const blockedByMe = selected?.status === 'blocked' && blockerId === String(user._id)
  const blockedByOther = selected?.status === 'blocked' && !blockedByMe
  const blockedMessage = blockedByOther
    ? `${other?.name || 'This user'} blocked you. You cannot send messages in this conversation.`
    : 'You blocked this user. Unblock them before sending another message.'

  const stopTyping = () => {
    clearTimeout(typingTimer.current)
    const chatId = activeChatRef.current
    if (typingSent.current && chatId) socketRef.current?.emit('typing:stop', { chatId })
    typingSent.current = false
  }

  const onTyping = (value) => {
    setText(value)
    const socket = socketRef.current
    if (!id || selected?.status === 'blocked' || !socket?.connected) return
    clearTimeout(typingTimer.current)
    if (!value.trim()) {
      stopTyping()
      return
    }
    if (!typingSent.current) {
      socket.emit('typing:start', { chatId: id })
      typingSent.current = true
    }
    typingTimer.current = setTimeout(stopTyping, 900)
  }

  const sendTextOverSocket = (message) => new Promise((resolve, reject) => {
    const socket = socketRef.current
    if (!socket?.connected) {
      reject(new Error('Live connection is unavailable'))
      return
    }
    const timeout = window.setTimeout(() => reject(new Error('Message delivery timed out')), 10000)
    socket.emit('message:send', { chatId: id, message }, (result) => {
      window.clearTimeout(timeout)
      if (result?.success) resolve(result.message)
      else reject(new Error(result?.message || 'Message could not be sent'))
    })
  })

  const send = async (event) => {
    event.preventDefault()
    if (selected?.status === 'blocked') {
      toast.error(blockedMessage)
      return
    }
    const messageText = text.trim()
    if (!messageText && !image) return
    setSending(true)
    stopTyping()

    try {
      let sentMessage
      if (!image && socketRef.current?.connected) {
        sentMessage = await sendTextOverSocket(messageText)
      } else {
        const form = new FormData()
        form.append('message', messageText)
        if (image) form.append('images', image)
        const { data } = await api.post(`/chats/${id}/messages`, form)
        sentMessage = data.message
      }
      receiveMessage(sentMessage)
      setText('')
      setImage(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const block = async () => {
    if (blockedByOther) {
      toast.error(blockedMessage)
      return
    }
    try {
      const { data } = await api.patch(`/chats/${id}/block`)
      setSelected((current) => ({ ...current, ...data.chat }))
      toast.success(data.message)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const report = async () => {
    try {
      await api.post('/complaints', { chat: id, reportedUser: other?._id, reportType: 'abusive_chat', description: reportDescription })
      toast.success('Chat reported for admin review')
      setReportOpen(false)
      setReportDescription('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (error) return <ErrorState message={error} onRetry={loadChats} />
  if (!chats) return <Spinner label="Opening secure chats" />

  return <div className="flex min-h-0 flex-col overflow-hidden pb-14 lg:pb-0" style={{ height: 'calc(100dvh - 8rem)' }}>
    {!id && <div className="hidden shrink-0 md:block"><PageHeader eyebrow="Secure item communication" title="Secure chats" description="Chat becomes available after a claim or when someone contacts the owner of a lost item. Personal phone numbers remain private." /></div>}
    <div className="card grid min-h-0 w-full flex-1 grid-cols-1 overflow-hidden">
      {!id && <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-100 p-4 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">Conversations</h2>
          <p className="mt-1 text-xs text-slate-400">{chats.length} secure conversation{chats.length === 1 ? '' : 's'}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {chats.length ? chats.map((chat) => {
            const participant = chat.participants?.find((entry) => entry && String(entry._id) !== String(user._id))
            return <button key={chat._id} onClick={() => navigate(`/chats/${chat._id}`)} className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${String(chat._id) === String(id) ? 'bg-brand-50 dark:bg-brand-500/5' : ''}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-xs font-black text-brand-700 dark:bg-brand-500/20">{initials(participant?.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2"><p className="truncate text-sm font-bold">{participant?.name || 'Campus member'}</p><span className="flex shrink-0 items-center gap-2">{chat.unreadCount > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[.6rem] font-bold leading-5 text-white">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span>}<span className="text-[.6rem] text-slate-400">{timeAgo(chat.updatedAt)}</span></span></div>
                <p className="mt-1 truncate text-xs text-slate-500">{chat.lastMessage?.message || chat.item?.title}</p>
              </div>
            </button>
          }) : <EmptyState title="No chats yet" message="Start a claim or use the contact icon on an active lost-item report." />}
        </div>
      </aside>}

      <section className={`${id ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-col overflow-hidden`}>
        {selected ? <>
          <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <button onClick={() => navigate('/chats')} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Back to conversations" title="Back to conversations">&larr;</button>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-xs font-black text-brand-700 dark:bg-brand-500/20">{initials(other?.name)}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{other?.name || 'Campus member'}</p><p className="truncate text-xs text-slate-400">{selected.kind === 'item_contact' ? 'Item contact' : 'Claim chat'} &middot; {selected.item?.title}</p></div>
            <span className={`hidden items-center gap-1.5 text-[.65rem] font-bold sm:flex ${connectionState === 'connected' && otherOnline ? 'text-emerald-500' : 'text-slate-400'}`} title={connectionState === 'connected' && otherOnline ? `${other?.name || 'User'} is online` : `${other?.name || 'User'} is offline`}>
              <span className={`size-2 rounded-full ${connectionState === 'connected' && otherOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              {connectionState === 'connected' && otherOnline ? 'Live' : 'Offline'}
            </span>
            {!blockedByOther && <button onClick={block} className={`grid size-9 place-items-center rounded-lg ${blockedByMe ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`} title={blockedByMe ? 'Unblock user' : 'Block user'} aria-label={blockedByMe ? 'Unblock user' : 'Block user'}><ShieldOff size={17} /></button>}
            <button onClick={() => setReportOpen(true)} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600" title="Report chat"><Flag size={17} /></button>
          </header>

          <div ref={messageScrollerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 p-4 dark:bg-slate-950/40">
            <div className="mx-auto max-w-3xl space-y-3">
              <div className="mx-auto mb-6 flex max-w-md gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><LockKeyhole size={16} className="shrink-0" />{selected.kind === 'item_contact' ? 'Use this chat to confirm the item safely. Never share passwords, OTPs, or complete identity numbers.' : 'Keep private answers inside the formal claim. Use chat only to coordinate next steps.'}</div>
              {messages.map((message) => {
                const mine = String(message.sender?._id || message.sender) === String(user._id)
                const read = mine && message.readBy?.some((reader) => String(reader?._id || reader) === otherUserId)
                return <div key={message._id} className={`flex min-w-0 ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[78%] break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm [overflow-wrap:anywhere] ${mine ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                  {message.image?.url && <img src={message.image.url} alt="Chat attachment" className="mb-2 max-h-56 rounded-xl" />}
                  {message.message && <p className="whitespace-pre-wrap leading-5">{message.message}</p>}
                  <p className={`mt-1 flex items-center justify-end gap-1 text-right text-[.58rem] ${mine ? 'text-brand-200' : 'text-slate-400'}`}><span>{timeAgo(message.createdAt)}</span>{mine && <CheckCheck size={13} strokeWidth={2.4} className={read ? 'text-sky-300' : 'text-brand-200'} aria-label={read ? 'Read' : 'Sent'} />}</p>
                </div></div>
              })}
              {typing && <p className="text-xs italic text-slate-400">{typing}</p>}
              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={send} className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
            {selected.status === 'blocked' && <div className={`mx-auto mb-3 flex max-w-3xl items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${blockedByOther ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}><ShieldOff size={16} className="mt-0.5 shrink-0" /><span>{blockedMessage}{blockedByMe && <button type="button" onClick={block} className="ml-1 underline underline-offset-2">Unblock user</button>}</span></div>}
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <label className={`grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 ${selected.status === 'blocked' ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ImagePlus size={19} /><input type="file" accept="image/*" className="hidden" disabled={selected.status === 'blocked'} onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>
              <div className="min-w-0 flex-1">
                {image && <p className="mb-1 truncate text-[.65rem] text-brand-600">Attachment: {image.name}</p>}
                <textarea rows="1" value={text} onChange={(event) => onTyping(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(event) } }} className="input min-h-10 max-h-28 resize-none py-2.5 leading-5" placeholder={selected.status === 'blocked' ? blockedMessage : 'Write a secure message...'} disabled={selected.status === 'blocked'} />
              </div>
              <button disabled={sending || selected.status === 'blocked'} className="btn-primary size-10 !p-0" aria-label="Send message">{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}</button>
            </div>
          </form>
        </> : id ? <Spinner label="Loading conversation" /> : <div className="grid flex-1 place-items-center text-center"><div><MessageCircle className="mx-auto text-slate-300" size={42} /><p className="mt-3 text-sm text-slate-500">Choose a conversation.</p></div></div>}
      </section>
    </div>

    <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report this chat" footer={<><button className="btn-secondary" onClick={() => setReportOpen(false)}>Cancel</button><button className="btn-primary !bg-rose-600" onClick={report}>Send to admin</button></>}>
      <p className="mb-4 text-sm text-slate-500">Reported chat messages become available to administrators for complaint review.</p>
      <textarea rows="5" className="input" value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} placeholder="Describe the abusive or suspicious behaviour..." />
    </Modal>
  </div>
}
