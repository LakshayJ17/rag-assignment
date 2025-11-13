"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import Header from "../components/Header";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  async function uploadFile() {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.message);
    setSuccess(data.success);
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-900">
      <Header />
      <div className="h-[calc(100vh-4rem)] bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Upload your document</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
            Drop a file or choose one to upload
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="file"
              className="w-full text-sm text-black dark:text-neutral-200 file:bg-neutral-300 dark:file:bg-neutral-700 file:text-black dark:file:text-neutral-100 file:px-3 file:py-1 file:rounded-md file:border-0 file:cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
              className="mt-2 sm:mt-0 inline-flex items-center cursor-pointer justify-center px-4 py-1 bg-neutral-800 dark:bg-neutral-300 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={uploadFile}
              disabled={!file || loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {file && (
            <div className="mt-4 bg-neutral-200 dark:bg-neutral-700 p-3 rounded-md text-sm text-black dark:text-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(file.size / 1024).toFixed(1)} KB{" "}
                  </div>
                </div>
                <button
                  className="text-xs text-neutral-600 dark:text-neutral-300 underline cursor-pointer"
                  onClick={() => setFile(null)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {result && (
            <pre className="mt-4 p-3 bg-neutral-200 dark:bg-neutral-700 text-black dark:text-neutral-100 rounded text-sm whitespace-pre-wrap">
              {result}
            </pre>
          )}

          {success && (
            <div className="mt-4">
              <button
                className="px-4 py-2 cursor-pointer bg-emerald-500 text-white rounded-md hover:bg-emerald-400"
                onClick={() => redirect("/chat")}
              >
                Start Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
