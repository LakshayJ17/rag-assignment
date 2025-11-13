export async function streamResponse(
  res: Response,
  onChunk: (chunk: string) => void
) {
  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    if (text) onChunk(text);
    return;
  }

  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) onChunk(decoder.decode(value));
  }
}