// pages/chat.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import clsx from "clsx";

interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  status?: "online" | "offline";
}

interface ChatMessage {
  id: string;
  user_id: string;
  text: string;
  name?: string;
  created_at: string;
  read?: boolean;
}

export default function ChatPage() {
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.user_metadata?.role === "admin";

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    }).catch((e) => console.error('getSession error', e));

    let listenerSub: any = null;
    try {
      const { data: listener } = supabase.auth.onAuthStateChange((_evt, s) => {
        if (mounted) setSession(s);
      });
      listenerSub = listener?.subscription;
    } catch (e) {
      console.error('auth listener error', e);
    }

    return () => {
      mounted = false;
      try {
        listenerSub?.unsubscribe?.();
      } catch (e) {
        // previously listener.subscription.unsubscribe(); guard in case of API differences
        try { listenerSub?.unsubscribe?.(); } catch (_) {}
      }
    };
  }, []);

  // Fetch users and status
  useEffect(() => {
    if (!isAdmin || !session) return;
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", session.user.id);
      setUsers(
        (data ?? []).map((u) => ({ ...u, status: "offline" })) // default offline
      );
    };
    fetchUsers();

    // Listen for presence / status updates
    let presenceSub: any = null;
    (async () => {
      try {
        presenceSub = supabase
          .channel("presence")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles" },
            (payload) => {
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === payload.new.id
                    ? { ...u, status: payload.new.status }
                    : u
                )
              );
            }
          )
          .subscribe();
      } catch (e) {
        console.error('presence subscription error', e);
      }
    })();

    return () => {
      try {
        presenceSub?.unsubscribe?.();
      } catch (e) {
        console.error('presence unsubscribe error', e);
      }
    };
  }, [isAdmin, session]);

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser || !session) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .or(`user_id.eq.${selectedUser.id},user_id.eq.${session.user.id}`)
        .order("created_at", { ascending: true })
        .limit(50);
      setMessages(data ?? []);
    };

    fetchMessages();

    // Real-time subscription
    let channelSub: any = null;
    let typingSub: any = null;
    (async () => {
      try {
        channelSub = supabase
          .channel("public:chats")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "chats" },
            (payload) => {
              const newMsg = payload.new as ChatMessage;
              if (
                selectedUser &&
                (newMsg.user_id === selectedUser.id ||
                  newMsg.user_id === session.user.id)
              ) {
                setMessages((prev) => [...prev, newMsg]);
              }
            }
          )
          .subscribe();

        typingSub = supabase
          .channel("typing")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "typing_status" },
            (payload) => {
              if (payload.new.user_id === selectedUser.id) {
                setTyping(payload.new.typing);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.error('chat subscription error', e);
      }
    })();

    return () => {
      try {
        channelSub?.unsubscribe?.();
      } catch (e) {
        console.error('channel unsubscribe error', e);
      }
      try {
        typingSub?.unsubscribe?.();
      } catch (e) {
        console.error('typing unsubscribe error', e);
      }
    };
  }, [selectedUser, session]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send typing status
  const handleTyping = async (val: string) => {
    setInput(val);
    if (!selectedUser) return;
    await supabase
      .from("typing_status")
      .upsert({ user_id: session.user.id, typing: val.length > 0 });
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          text: input,
          user_id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email,
          receiver_id: selectedUser.id,
        },
      ])
      .select()
      .single();
    if (!error && data) setMessages((prev) => [...prev, data]);
    setInput("");
    await supabase.from("typing_status").upsert({ user_id: session.user.id, typing: false });
  };

  if (!session) {
    return (
      <Layout>
        <div className="flex h-80 items-center justify-center">
          <a
            href="/auth"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            Sign in to chat
          </a>
        </div>
      </Layout>
    );
  }

  // Regular user chat
  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex flex-col h-[80vh] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isMe = m.user_id === session.user.id;
              return (
                <div
                  key={m.id}
                  className={clsx(
                    "flex flex-col max-w-[75%] p-3 rounded-2xl shadow-sm",
                    isMe
                      ? "ml-auto bg-gradient-to-tr from-blue-500 to-blue-600 text-white rounded-br-none"
                      : "mr-auto bg-gradient-to-tr from-gray-300 to-gray-400 text-gray-900 dark:from-gray-700 dark:to-gray-600 dark:text-white rounded-bl-none"
                  )}
                >
                  <div className="font-medium">{m.name}</div>
                  <div>{m.text}</div>
                  <div className="text-xs mt-1 text-gray-200 dark:text-gray-300 text-right">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
            {typing && <div className="text-sm text-gray-500">Admin is typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="flex p-4 gap-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <input
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
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
      </Layout>
    );
  }

  // Admin view
  return (
    <Layout>
      <div className="flex h-[80vh] border dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
        {/* Sidebar */}
        <div className="w-72 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
          <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Users</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {users.map((u) => {
              const lastMsg = messages.filter(
                (m) => m.user_id === u.id || m.user_id === session.user.id
              ).slice(-1)[0];
              const unreadCount = messages.filter(
                (m) => m.user_id === u.id && !m.read
              ).length;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={clsx(
                    "flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700",
                    selectedUser?.id === u.id ? "bg-gray-300 dark:bg-gray-600" : ""
                  )}
                >
                  <div className="relative w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold mr-3">
                    {u.full_name?.[0] || u.email?.[0]}
                    {u.status === "online" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{u.full_name || u.email}</div>
                    {lastMsg && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lastMsg.text}
                      </div>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2 rounded-full">
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center p-4 border-b dark:border-gray-700">
            {selectedUser ? (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold mr-3">
                  {selectedUser.full_name?.[0] || selectedUser.email?.[0]}
                  {selectedUser.status === "online" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name || selectedUser.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedUser.status === "online" ? "Online" : "Offline"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Select a user to chat</div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedUser &&
              messages.map((m) => {
                const isMe = m.user_id === session.user.id;
                return (
                  <div
                    key={m.id}
                    className={clsx(
                      "flex flex-col max-w-[75%] p-3 rounded-2xl shadow-sm",
                      isMe
                        ? "ml-auto bg-gradient-to-tr from-blue-500 to-blue-600 text-white rounded-br-none"
                        : "mr-auto bg-gradient-to-tr from-gray-300 to-gray-400 text-gray-900 dark:from-gray-700 dark:to-gray-600 dark:text-white rounded-bl-none"
                    )}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div>{m.text}</div>
                    <div className="text-xs mt-1 text-gray-200 dark:text-gray-300 text-right">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            {typing && <div className="text-sm text-gray-500">Typing...</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {selectedUser && (
            <div className="flex p-4 gap-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <input
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
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
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["nav", "common"])),
    },
    revalidate: 60,
  };
};
