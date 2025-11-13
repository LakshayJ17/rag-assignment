"use client";

import Link from "next/link";
import { Upload, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 relative min-h-screen w-full flex flex-col items-center justify-center">
      <div
        className="absolute inset-0 z-0 bg-no-repeat blur-[80px] bg-[radial-gradient(circle_at_top_center,rgba(56,193,182,0.5),transparent_90%)]"
      />

      <div className="max-w-4xl w-full text-center space-y-8 relative">
        <h1 className="text-6xl md:text-8xl font-bold dark:text-white text-black">
          DocuChat AI
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Upload your documents and chat with them using AI. Get instant answers
          from your PDFs, docs, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/upload">
            <button className="flex items-center cursor-pointer gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-lg font-medium w-full sm:w-auto">
              <Upload className="w-5 h-5" />
              Upload PDF
            </button>
          </Link>

          <Link href="/chat">
            <button className="flex items-center cursor-pointer gap-2 px-8 py-4 bg-neutral-800 dark:bg-neutral-100 text-white dark:text-black hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors rounded-lg text-lg font-medium w-full sm:w-auto">
              <MessageSquare className="w-5 h-5" />
              Chat Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
