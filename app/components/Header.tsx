"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-20 bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-300 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold text-black dark:text-white"
        >
          DocuChat AI
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
