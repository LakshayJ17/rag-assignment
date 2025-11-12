export const runtime = "nodejs";

import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone'
import { chunkText } from '@/utils/chunkText';
import pdfParse from "pdf-parse-fork";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! as string });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! as string })


export async function POST(req: NextRequest) {

    // Rag pipeline = pdf parse -> chunking -> embedding -> storing -> retrieval

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No uploaded file' },
                { status: 400 }
            );
        }
        console.log("FILE FROM FRONTEND : ", file);


        // Convert file -> array buffer -> buffer 
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Parsing
        const fileData = await (pdfParse as any)(buffer)
        // console.log("Parsed PDF data:", fileData);

        const fileText = fileData.text

        if (!fileText || fileText.trim().length === 0) {
            return NextResponse.json(
                { error: "No text extracted from PDF" },
                { status: 400 }
            );
        }

        // Chunking
        const textChunks = chunkText(fileText)
        // console.log("Text chunks : ", textChunks);

        // Embedding 
        const embeddings = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textChunks
        })

        // console.log(embeddings)

        
        // Storing in vector db - pineconedb
        const indexName = process.env.PINECONE_INDEX_NAME as string;
        const existingIndexes = await pc.listIndexes();

        const indexExists = existingIndexes.indexes?.some(
            (i) => i.name === indexName
        );

        if (!indexExists) {
            await pc.createIndex({
                name: indexName,
                dimension: 1536,
                metric: "cosine",
                spec: {
                    serverless: {
                        cloud: "aws",
                        region: "us-east-1",
                    },
                },
            });
            console.log(`Created new index: ${indexName}`);
        } else {
            console.log(`Index "${indexName}" already exists.`);
        }


        const pdfName = file.name.replace(/\.[^/.]+$/, "");
        const namespace = `${pdfName}_${Date.now()}`;

        const vectors = embeddings.data.map((item, i) => ({
            id: `${namespace}_chunk_${i}`,
            values: item.embedding,
            metadata: {
                text: textChunks[i],
                source: pdfName,
                chunkIndex: i,
            },
        }));


        const index = pc.index(indexName)
        await index.namespace(namespace).upsert(vectors)
        console.log(`Successfully added vectors into DB : ${namespace} `)

        return NextResponse.json({
            success: true,
            message: `Sucessfully embedded and added chunks to db`,
            namespace
        })
    } catch (error) {
        console.log("Error in /pdf/upload : ", error)
        return NextResponse.json({
            error: "Unable to complete request at this moment"
        }, { status: 500 })
    }

}