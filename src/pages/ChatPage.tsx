import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Conversation, Message } from '@/lib/types';
import { StatusBar } from '@/components/StatusBar';
import { ArrowLeft, Phone, Video, Mic, Plus, Send } from 'lucide-react';

export function ChatPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'thread'>('list');
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock conversation matching the design
  const mockConv: Conversation = {
    id: 'mock-conv',
    name: 'Food Shelter',
    avatar_url: null,
    last_message: 'Here: xyz Road',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const mockMessages: Message[] = [
    { id: '1', conversation_id: 'mock-conv', sender_id: 'other', content: 'Is there a Volunteer Opportunity Today?', created_at: '2023-11-30T09:41:00Z' },
    { id: '2', conversation_id: 'mock-conv', sender_id: 'me', content: 'Yes', created_at: '2023-11-30T09:42:00Z' },
    { id: '3', conversation_id: 'mock-conv', sender_id: 'me', content: 'There Is!', created_at: '2023-11-30T09:42:05Z' },
    { id: '4', conversation_id: 'mock-conv', sender_id: 'me', content: 'July 5 @ 7PM', created_at: '2023-11-30T09:42:10Z' },
    { id: '5', conversation_id: 'mock-conv', sender_id: 'other', content: 'Can you please tell me where!', created_at: '2023-11-30T09:43:00Z' },
    { id: '6', conversation_id: 'mock-conv', sender_id: 'other', content: 'Thanks!', created_at: '2023-11-30T09:43:05Z' },
    { id: '7', conversation_id: 'mock-conv', sender_id: 'me', content: 'Yes Ofcourse', created_at: '2023-11-30T09:44:00Z' },
    { id: '8', conversation_id: 'mock-conv', sender_id: 'me', content: 'Here:', created_at: '2023-11-30T09:44:05Z' },
    { id: '9', conversation_id: 'mock-conv', sender_id: 'me', content: 'xyz Road', created_at: '2023-11-30T09:44:10Z' },
  ];

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: members } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);
      const ids = (members || []).map(m => m.conversation_id);
      if (ids.length === 0) return;
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', ids)
        .order('last_message_at', { ascending: false });
      setConversations(convs || []);
    })();
  }, [user]);

  useEffect(() => {
    if (!active || active.id === 'mock-conv') {
      if (active?.id === 'mock-conv') setMessages(mockMessages);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', active.id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    })();
    const ch = supabase
      .channel(`msg-${active.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active.id}` },
        (p) => setMessages(prev => [...prev, p.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !active || !input.trim()) return;
    const text = input.trim();
    setInput('');
    if (active.id === 'mock-conv') {
      setMessages(prev => [...prev, { id: `local-${Date.now()}`, conversation_id: 'mock-conv', sender_id: 'me', content: text, created_at: new Date().toISOString() }]);
      return;
    }
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: active.id, sender_id: user.id, content: text })
      .select('*')
      .single();
    if (data) {
      await supabase.from('conversations').update({ last_message: text, last_message_at: new Date().toISOString() }).eq('id', active.id);
    }
  };

  // Thread view
  if (view === 'thread' && active) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <StatusBar />
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100">
          <button onClick={() => { setView('list'); setActive(null); }}>
            <ArrowLeft size={22} className="text-black" />
          </button>
          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black">
            {active.name?.[0] || 'F'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-black">{active.name}</p>
            <p className="text-[11px] text-gray-400">Active 11m ago</p>
          </div>
          <Phone size={18} className="text-black" />
          <Video size={20} className="text-black" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-white">
          <p className="text-center text-[11px] text-gray-400 my-2">Nov 30, 2023, 9:41 AM</p>
          {messages.map(m => {
            const mine = m.sender_id === 'me' || m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 text-sm ${
                    mine
                      ? 'bg-gray-100 text-black rounded-2xl rounded-br-md'
                      : 'bg-black text-white rounded-2xl rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 pb-6">
          <button className="text-gray-400"><Plus size={24} /></button>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
          </div>
          <button onClick={sendMessage} className="text-black">
            {input.trim() ? <Send size={22} /> : <Mic size={22} />}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-white pb-24">
      <StatusBar />
      <div className="px-5 pt-2">
        <h1 className="text-2xl font-bold text-black">Messages</h1>
      </div>

      <div className="mt-4">
        {conversations.length === 0 ? (
          <button
            onClick={() => { setActive(mockConv); setView('thread'); }}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-black">
              F
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-black">Food Shelter</p>
              <p className="text-xs text-gray-400 truncate">Here: xyz Road</p>
            </div>
            <span className="text-[11px] text-gray-400">now</span>
          </button>
        ) : (
          conversations.map(c => (
            <button
              key={c.id}
              onClick={() => { setActive(c); setView('thread'); }}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-black">
                {c.name?.[0] || 'C'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-black">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.last_message || 'No messages yet'}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
