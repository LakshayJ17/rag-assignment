import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { streamText } from "ai";
import { openai as openAi } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string })

export async function POST(req: NextRequest) {

    // Getting user query, namespace and model choice from frontend
    // Creating embedding of user query
    // Retrieving relevant chunks from db -> context
    // passing user query + context to llm of choice 
    // return response and source 

    const { query, model } = await req.json()

    if (!query || !model) {
        return NextResponse.json(
            { error: "Missing query or model" },
            { status: 400 }
        )
    }

    const embeddings = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
    })

    const queryEmbedding = embeddings.data[0].embedding

    const index = pc.index(process.env.PINECONE_INDEX_NAME as string)
    const result = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true
    })

    console.log("Result from fetching : ", result.matches)

    if (!result.matches || result.matches.length == 0) {
        return NextResponse.json({
            response: "No relevant information found. Try with a different input",
            sources: []
        })
    }


    const context = result.matches
        .map((m) => m.metadata?.text)
        .join("\n\n");

    const systemPrompt = `You are a helpful assistant. Use the provided context to answer the user's question accurately.
        If the answer is not present in the context, say "I don't have enough information to answer that."

        Context:
        ${context}
    `;

    const stream = await streamText({
        model:
            model === "openai"
                ? openAi("gpt-4o-mini")
                : google("gemini-2.0-flash"),
        system: systemPrompt,
        messages: [{ role: "user", content: query }],
    });

    const sources = result.matches.map((m) => {
        const text = m.metadata?.text;
        const slicedText = typeof text === "string" ? text.slice(0, 200) : undefined;
        return {
            text: slicedText,
            source: m.metadata?.source,
        };
    });

    const encodedSources = Buffer
        .from(JSON.stringify(sources), "utf-8")
        .toString("base64");

    const response = stream.toTextStreamResponse();
    response.headers.set("Content-Type", "text/plain");
    response.headers.set("X-Sources", encodedSources);

    return response;
}