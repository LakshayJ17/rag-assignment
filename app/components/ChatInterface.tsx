"use client";

import { Bot, User } from "lucide-react";

interface IMessage {
  role: "assistant" | "user";
  content?: string | null;
  sources?: Array<{ text?: string; source?: string }>;
}

export default function ChatInterface({ message }: { message: IMessage }) {
  const isUser = message?.role === "user";

  return (
    <div className={`w-full mb-4`}>
      <div
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } gap-3 items-start`}
      >
        {!isUser && (
          <div className="bg-neutral-200 dark:bg-neutral-100 flex items-center justify-center text-black rounded-full p-2">
            <Bot />
          </div>
        )}

        <div
          className={`${
            isUser
              ? "bg-emerald-600 text-white"
              : "bg-neutral-200 dark:bg-neutral-800 text-black dark:text-neutral-100"
          } max-w-[80%] p-3 rounded-md`}
        >
          <div className="text-sm whitespace-pre-wrap">
            {message?.content == null ? (
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce animation-delay-200" />
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce animation-delay-400" />
              </div>
            ) : (
                <div className="prose prose-neutral dark:prose-invert">
                    {message.content}
                </div>
            )}
          </div>
        </div>

        {isUser && (
          <div className="bg-neutral-200 dark:bg-neutral-100 flex items-center justify-center text-black rounded-full p-2">
            <User />
          </div>
        )}
      </div>
      {message?.sources && message.sources.length > 0 && (
        <div className="mt-2 ml-12 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="font-medium text-neutral-700 dark:text-neutral-400 mb-1">Sources:</div>
          <ul className="space-y-1">
            {message.sources.map((s, i) => (
              <li key={i} className="bg-neutral-200 dark:bg-neutral-800 p-2 rounded text-neutral-800 dark:text-neutral-200">
                {s.source ? (
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    {s.source}:{" "}
                  </span>
                ) : null}
                {s.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
