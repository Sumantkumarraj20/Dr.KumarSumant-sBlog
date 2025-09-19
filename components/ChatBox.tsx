import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ChatBoxProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

export interface ChatMessage {
  id: string;
  user_id: string;
  text: string;
  name?: string;
  created_at: string;
}

export default function ChatBox({ user }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and setup real-time subscription
  useEffect(() => {
    if (!user) return;

    let channel: ReturnType<typeof supabase['channel']> | null = null;

    const initChat = async () => {
      // Fetch initial messages
      const { data } = await supabase
        .from('chats')
        .select('*')
        .order('created_at');

      setMessages(data ?? []);

      // Subscribe to new messages
      channel = supabase
        .channel('public:chats')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chats' },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (newMsg?.id && newMsg?.user_id && newMsg?.text && newMsg?.created_at) {
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        )
        .subscribe();
    };

    initChat();

    // Cleanup subscription
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          text: input,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email,
        },
      ])
      .select()
      .single();

    if (!error && data) setMessages((prev) => [...prev, data]);
    setInput('');
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-[70vh] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 border rounded">
        {messages.map((m) => {
          const isMe = m.user_id === user.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-xl max-w-[75%] break-words ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                <div className="text-sm font-medium">{m.name}</div>
                <div className="mt-1">{m.text}</div>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1 text-right">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
