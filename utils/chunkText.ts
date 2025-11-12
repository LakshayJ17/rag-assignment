export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    const step = chunkSize - overlap;

    for (let i = 0; i < text.length; i += step) {
        const currentChunk = text.slice(i, i + chunkSize)
        chunks.push(currentChunk);
    }

    return chunks;
}

