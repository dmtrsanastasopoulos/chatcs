"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ApiSuggestion = {
  id: string;
  label: string;
  targetAnswerId: string | null;
  targetCanonicalId?: string;
};

type ApiResponse = {
  interpretedAs: string;
  canonicalId: string;
  answer: {
    answerId: string;
    title: string;
    content: string;
  };
  suggestions: ApiSuggestion[];
};

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string; // what is currently displayed (typewriter will update this)
  fullText?: string; // full final answer for typewriter
  interpretedAs?: string;
  suggestions?: ApiSuggestion[];
  isThinking?: boolean; // shows thinking dots
  isTyping?: boolean; // typewriter in progress
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false); // waiting for API response
  const [typingId, setTypingId] = useState<string | null>(null); // currently typing message id
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  const busy = useMemo(() => loading || !!typingId, [loading, typingId]);
  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  const callApi = async (payload: any): Promise<ApiResponse> => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text();
      throw new Error(raw || `Request failed (${res.status})`);
    }
    return res.json();
  };

  const startTypewriter = (messageId: string, fullText: string) => {
    // safety: clear any existing typing
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    setTypingId(messageId);

    let i = 0;
    // tune these two to your taste
    const charsPerTick = 3;
    const ms = 14;

    typingTimerRef.current = window.setInterval(() => {
      i += charsPerTick;
      const slice = fullText.slice(0, i);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, text: slice } : m
        )
      );

      if (i >= fullText.length) {
        if (typingTimerRef.current) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isTyping: false } : m
          )
        );
        setTypingId(null);
      }
    }, ms);
  };

  const send = async (userText: string, payload: any) => {
    setError(null);

    // 1) push user message
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    // 2) push assistant "thinking" placeholder immediately
    const thinkingMsgId = `a-${Date.now()}`;
    const thinkingMsg: Msg = {
      id: thinkingMsgId,
      role: "assistant",
      text: "",
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    setLoading(true);
    setInput("");
    setTimeout(scrollToBottom, 30);

    try {
      const data = await callApi(payload);

      const full = data.answer.content;

      // 3) replace thinking msg with an empty assistant msg ready to type
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? {
                ...m,
                isThinking: false,
                isTyping: true,
                text: "",
                fullText: full,
                interpretedAs: data.interpretedAs,
                suggestions: data.suggestions,
              }
            : m
        )
      );

      setLoading(false);
      setTimeout(scrollToBottom, 30);

      // 4) typewriter reveal
      startTypewriter(thinkingMsgId, full);
    } catch (e: any) {
      // remove thinking bubble and show error
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMsgId));
      setError(e.message || "Something went wrong");
      setLoading(false);
    } finally {
      setTimeout(scrollToBottom, 50);
    }
  };

  const onSend = async () => {
    if (!canSend) return;
    const text = input.trim();
    await send(text, { input: text });
  };

  const onSuggestionClick = async (s: ApiSuggestion) => {
    if (busy) return;

    // show the click as a user message for conversational feel
    const userText = s.label;

    if (s.targetAnswerId) {
      // send BOTH: label for context + targetAnswerId for deterministic jump
      await send(userText, { input: userText, targetAnswerId: s.targetAnswerId });
    } else {
      // no target → just ask the follow-up text
      await send(userText, { input: userText });
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* thinking dots animation */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: translateY(0); opacity: .4; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          display: inline-block;
          background: rgb(161 161 170); /* zinc-400 */
          animation: dotPulse 1s infinite;
        }
        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }
      `}</style>

      <header className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-blue-500 flex items-center justify-center text-xs font-bold">
            CS
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold">CS Brain</div>
            <div className="text-[11px] text-zinc-400">MVP — Onboarding → Risk</div>
          </div>
        </div>
      </header>

      <section className="flex-1 px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-sm text-zinc-400 border border-zinc-900 rounded-xl p-4 bg-black/40">
              Ask something like:{" "}
              <span className="text-zinc-200">“Is onboarding complete?”</span>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] bg-fuchsia-600/90 rounded-2xl rounded-br-md px-4 py-2 text-sm whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[100%] bg-black/60 border border-zinc-900 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold">
                      AI
                    </div>
                    <div className="text-xs font-semibold">CS Brain</div>

                    {/* thinking dots */}
                    {m.isThinking && (
                      <div className="ml-2 flex items-center gap-2 text-xs text-zinc-500">
                        thinking
                        <span className="inline-flex gap-1 items-center">
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
                        </span>
                      </div>
                    )}

                    {/* typing indicator (optional) */}
                    {m.isTyping && !m.isThinking && (
                      <div className="ml-2 text-xs text-zinc-500">writing…</div>
                    )}
                  </div>

                  {/* interpreted as line */}
                  {!m.isThinking && m.interpretedAs && (
                    <div className="text-[11px] text-zinc-500 mb-2">
                      Interpreted as:{" "}
                      <span className="text-zinc-300">{m.interpretedAs}</span>
                    </div>
                  )}

                  {/* answer text with correct spacing */}
                  {!m.isThinking && (
                    <div className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                      {m.text}
                    </div>
                  )}

                  {/* suggestions */}
                  {!m.isThinking && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.suggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onSuggestionClick(s)}
                          className="text-[12px] px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition disabled:opacity-50"
                          disabled={busy}
                          title={s.targetAnswerId ? "Jump to answer" : "Ask follow-up"}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          <div ref={endRef} />

          {error && (
            <div className="text-sm text-red-400 border border-red-900 bg-red-950/30 rounded-xl p-3">
              {error}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            className="flex-1 bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={busy ? "Please wait…" : "Ask a question…"}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            className="px-4 h-16 rounded-xl bg-gradient-to-r from-fuchsia-500 to-blue-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </footer>
    </main>
  );
}