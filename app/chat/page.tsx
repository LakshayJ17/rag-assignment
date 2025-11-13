"use client";

import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ChatInterface from "../components/ChatInterface";
import Header from "../components/Header";
import { streamResponse } from "@/lib/stream";

interface IMessage {
  role: "assistant" | "user";
  content?: string | null;
  sources?: Array<{ text?: string; source?: string }>;
}

export default function Chat() {
  const [model, setModel] = useState<"openai" | "gemini">("openai");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const assistantIndexRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // For persistent history - save in local storage on every message
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("chat-history");
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

//   async function streamResponse(
//     res: Response,
//     onChunk: (chunk: string) => void
//   ) {
//     const reader = res.body?.getReader();
//     if (!reader) {
//       const text = await res.text();
//       if (text) onChunk(text);
//       return;
//     }

//     const decoder = new TextDecoder();
//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) break;
//       if (value) onChunk(decoder.decode(value));
//     }
//   }

  async function sendMessage() {
    if (!query.trim()) return;

    setLoading(true);

    setMessages((prev) => {
      const next: IMessage[] = [
        ...prev,
        { role: "user", content: query } as IMessage,
        { role: "assistant", content: null } as IMessage,
      ];
      assistantIndexRef.current = next.length - 1;
      return next;
    });

    try {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(await res.text());

      // decode sources
      const xs = res.headers.get("X-Sources");
      if (xs) {
        try {
          const parsed = JSON.parse(atob(xs));
          setMessages((prev) => {
            const copy = [...prev];
            const idx = assistantIndexRef.current!;
            copy[idx] = { ...copy[idx], sources: parsed };
            return copy;
          });
        } catch (err) {
          console.warn("Failed to parse sources:", err);
        }
      }

      const idx = assistantIndexRef.current!;

      // STREAM CHUNKS
      await streamResponse(res, (chunk) => {
        setMessages((prev) => {
          const copy = [...prev];
          const prevText = copy[idx].content ?? "";
          copy[idx] = { ...copy[idx], content: prevText + chunk };
          return copy;
        });
      });

      // fallback if nothing streamed
      setMessages((prev) => {
        const copy = [...prev];
        if (!copy[idx].content) copy[idx].content = "[No response]";
        return copy;
      });
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        (err as { name?: string }).name !== "AbortError"
      ) {
        const idx = assistantIndexRef.current!;
        setMessages((prev) => {
          const copy = [...prev];
          const prevText = copy[idx].content ?? "";
          copy[idx].content = prevText + "\n\n[Error receiving response]";
          return copy;
        });
      }
    } finally {
      setLoading(false);
      setQuery("");
      assistantIndexRef.current = null;
      controllerRef.current = null;
    }
  }

  return (
  <div className="min-h-svh w-full bg-neutral-100 dark:bg-neutral-900">
      <Header />
      <div className="text-black dark:text-white h-[calc(100svh-5rem)] w-full flex flex-col items-center p-3 sm:p-4 gap-4 sm:gap-5">
        <div className="relative z-10 overflow-visible flex flex-col sm:flex-row sm:items-center justify-between max-w-5xl w-full gap-3 sm:gap-4 px-3 sm:px-5 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm sm:text-base">Select a Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as "openai" | "gemini")}
              className="w-full sm:w-64 max-w-full text-black dark:text-white border border-neutral-300 dark:border-neutral-700 p-2 sm:p-2.5 rounded-md bg-white dark:bg-neutral-800"
            >
              <option value="openai">OpenAI (gpt-40-mini)</option>
              <option value="gemini">Gemini (gemini-2.0-flash)</option>
            </select>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("chat-history");
              setMessages([]);
            }}
            className="w-full sm:w-auto p-2.5 bg-red-700 hover:bg-red-600 transition-colors rounded-md text-white text-sm"
          >
            Clear chat
          </button>
        </div>

        <div className="w-full max-w-5xl flex-1 mt-2 sm:mt-4">
          <div className="relative z-0 flex flex-col overflow-auto h-[calc(100svh-18rem)] md:h-[calc(100svh-16rem)] px-3 sm:px-5 py-4 sm:py-6 pb-28 sm:pb-24 md:pb-20 hide-scrollbar">
            {messages.map((msg, idx) => (
              <ChatInterface key={idx} message={msg} />
            ))}
          </div>

          <div className="fixed bottom-5 md:bottom-5 left-1/2 -translate-x-1/2 w-full max-w-5xl px-3 sm:px-5">
            <div className="flex  w-full gap-2 sm:gap-3 md:gap-5">
              <input
                type="text"
                placeholder="Enter your question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border border-neutral-300 dark:border-neutral-700 p-2 rounded-md bg-white dark:bg-neutral-800 text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className=" inline-flex items-center justify-center px-4 py-2 bg-neutral-800 dark:bg-neutral-300 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
