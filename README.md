# DocuChat AI 🤖📄

A modern, AI-powered document chat application that allows users to upload PDF documents and have natural conversations with their content using advanced language models.

## ✨ Features

- **📤 PDF Upload**: Easy drag-and-drop interface for uploading PDF documents
- **🧠 AI-Powered Chat**: Chat with your documents using OpenAI GPT-4o-mini or Google Gemini 2.0 Flash
- **🔍 Semantic Search**: Uses vector embeddings and Pinecone for intelligent document retrieval
- **💬 Streaming Responses**: Real-time streaming of AI responses for better UX
- **📚 Source Attribution**: View the exact document chunks used to generate each answer
- **💾 Persistent History**: Chat history saved in browser localStorage
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS 4
- **🌙 Dark Theme**: Elegant neutral color scheme optimized for readability

## 🏗️ Architecture

### RAG Pipeline

The application implements a complete Retrieval-Augmented Generation (RAG) pipeline:

1. **Document Processing**
   - PDF parsing using `pdf-parse-fork`
   - Text chunking with configurable size (1000 chars) and overlap (200 chars)

2. **Embedding Generation**
   - Uses OpenAI's `text-embedding-3-small` model
   - Generates 1536-dimensional vector embeddings

3. **Vector Storage**
   - Stores embeddings in Pinecone vector database
   - Cosine similarity metric for semantic search
   - Metadata includes source file and chunk index

4. **Retrieval & Generation**
   - Queries Pinecone for top 5 relevant chunks
   - Passes context to LLM (OpenAI or Gemini)
   - Streams responses in real-time

## 🚀 Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library

### Backend & AI
- **Vercel AI SDK** - Unified AI interface
- **OpenAI API** - GPT-4o-mini for chat & embeddings
- **Google Gemini API** - Gemini 2.0 Flash model
- **Pinecone** - Vector database for embeddings
- **pdf-parse-fork** - PDF text extraction

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys for:
  - OpenAI API
  - Pinecone
  - Google AI (for Gemini)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/LakshayJ17/rag-assignment.git
cd buildfast-assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_index_name

# Google AI (for Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
buildfast-assignment/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Chat API endpoint
│   │   └── upload/
│   │       └── route.ts          # PDF upload API endpoint
│   ├── chat/
│   │   └── page.tsx              # Chat interface page
│   ├── components/
│   │   ├── ChatInterface.tsx     # Message bubble component
│   │   └── Header.tsx            # Navigation header
|   |   └── ThemeToggle.tsx       # Theme Toggle
│   ├── upload/
│   │   └── page.tsx              # Upload interface page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── utils/
│   └── chunkText.ts              # Text chunking utility
├── lib/
│   └── stream.ts              
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎯 Usage

### 1. Upload a PDF Document

- Click "Upload PDF" on the landing page
- Select a PDF file from your device
- Wait for processing (parsing → chunking → embedding → storage)
- Click "Start Chat" once upload is complete

### 2. Chat with Your Document

- Enter your question in the chat input
- Select AI model (OpenAI or Gemini)
- Watch the AI stream its response in real-time
- View source citations below each answer
- Clear chat history anytime with "Clear chat" button

### 3. Model Selection

Switch between two powerful AI models:
- **OpenAI (GPT-4o-mini)**: Fast, cost-effective, excellent reasoning
- **Gemini (2.0 Flash)**: Google's latest model with strong performance

## 🔑 Key Features Explained

### Streaming Responses
The application uses Vercel AI SDK's `streamText()` for real-time response streaming, providing instant feedback as the AI generates answers.

### Source Attribution
Each answer includes references to the original document chunks used, with:
- First 200 characters of each source chunk
- Source filename
- Up to 5 relevant chunks per query

### Smart Chunking
Documents are split into overlapping chunks (1000 chars with 200 char overlap) to maintain context across chunk boundaries.

### Persistent Chat History
Conversations are automatically saved to browser localStorage, persisting across page refreshes.

## 🛠️ API Endpoints

### POST `/api/upload`
Upload and process a PDF document.

**Request:**
- `Content-Type: multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "success": true,
  "message": "File successfully uploaded. Start chatting.."
}
```

### POST `/api/chat`
Send a query and receive streaming AI response.

**Request:**
```json
{
  "query": "What is this document about?",
  "model": "openai" // or "gemini"
}
```

**Response:**
- Streaming text response
- `X-Sources` header with base64-encoded source chunks

## 🎨 Styling & Design

- **Neutral Dark Theme**: Professional dark mode with neutral-900 background
- **Responsive Design**: Fully responsive from mobile to desktop
- **Gradient Accents**: Emerald-to-blue gradients for branding
- **Smooth Animations**: Hover effects and transitions throughout
- **Accessible**: Focus states and semantic HTML

## 🚦 Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### "Invalid JSON" Error
- Ensure your `.env.local` file has all required API keys
- Check that Pinecone index exists or allow auto-creation

### PDF Upload Fails
- Verify PDF is not password-protected
- Check file size (large PDFs may timeout)
- Ensure OpenAI and Pinecone API keys are valid

### No Responses from Chat
- Verify vectors were successfully uploaded to Pinecone
- Check browser console for API errors
- Confirm model name is correct ("openai" or "gemini")

### Dev Server Won't Start
- Remove trailing commas from `package.json` if present
- Clear `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
- Delete `node_modules` and reinstall: `npm install`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings and chat | Yes |
| `PINECONE_API_KEY` | Pinecone API key for vector storage | Yes |
| `PINECONE_INDEX_NAME` | Name of your Pinecone index | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini | Yes |

## 🔐 Security Notes

- API keys are server-side only (not exposed to client)
- File uploads are validated for type and content
- No sensitive data is stored in localStorage
- Consider adding authentication for production use

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- Environment variables
- Serverless functions or Node.js runtime

## 📦 Dependencies

### Production
- `next`: ^16.0.1
- `react`: ^19.2.0
- `@ai-sdk/openai`: ^2.0.65
- `@ai-sdk/google`: ^2.0.31
- `ai`: ^5.0.93
- `@pinecone-database/pinecone`: ^6.1.3
- `openai`: ^6.8.1
- `pdf-parse-fork`: ^1.2.0
- `lucide-react`: ^0.553.0
- `tailwindcss`: ^4.1.17

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is for educational/assignment purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenAI](https://openai.com/) and [Google Gemini](https://deepmind.google/technologies/gemini/)
- Vector search by [Pinecone](https://www.pinecone.io/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for BuildFast Assignment**
