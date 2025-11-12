import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { streamText } from "ai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string })

export async function POST(req: NextRequest) {

    // Getting user query, namespace and model choice from frontend
    // Creating embedding of user query
    // Retrieving relevant chunks from db -> context
    // passing user query + context to llm of choice 
    // return response and source 

    const { query, namespace, model } = await req.json()

    if (!query || !namespace || !model) {
        return NextResponse.json(
            { error: "Missing query or namespace or model" },
            { status: 400 }
        )
    }

    const embeddings = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
    })

    const queryEmbedding = embeddings.data[0].embedding

    const index = pc.index(process.env.PINECONE_INDEX_NAME as string)
    const result = await index.namespace(namespace).query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true
    })

    if (!result.matches || result.matches.length == 0) {
        return NextResponse.json({
            response: "No relevant information found. Try with a different input",
            sources: []
        })
    }

    console.log("Result from fetching : ", result.matches)

    const context = result.matches
        .map((m) => m.metadata?.text)
        .join("\n\n");

    const systemPrompt = `You are a helpful assistant. Use the provided context to answer the user's question accurately.
        If the answer is not present in the context, say "I don't have enough information to answer that."

        Context:
        ${context}
    `;

    let answer: any = ""

    if (model == "openai") {
        const chatResult = await streamText({
            model: 'gpt-4o-mini',
            system: systemPrompt,
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": query }
            ]

        })
        // const chatResult = await openai.chat.completions.create({
        //     model: 'gpt-4o-mini',
        //     messages: [
        //         { "role": "system", "content": systemPrompt },
        //         { "role": "user", "content": query }
        //     ]
        // })

        answer = chatResult.toTextStreamResponse();

    }

    if (model === "gemini") {
        const chatResult = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `${systemPrompt}\n\nUser Question: ${query}`;
        const geminiResponse = await chatResult.generateContent(prompt);
        const responseText = geminiResponse.response.text();

        answer = responseText || "";
    }

    return NextResponse.json({
        response: answer,
        sources: result.matches.map((m) => ({
            text: m.metadata?.text,
            source: m.metadata?.source
        }))
    })

}