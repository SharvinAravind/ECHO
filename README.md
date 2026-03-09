# EchoWrite - AI-Powered Writing Suite

EchoWrite is an advanced AI writing assistant that converts voice to text, refines writing styles, and generates visual diagrams.

## Project Features

- **Voice-to-Text**: Support for 25+ languages.
- **26 Writing Styles**: Professional, creative, academic, and more.
- **AI Visuals**: Generate Mermaid.js diagrams, flowcharts, and mindmaps from text.
- **Multi-Length Variations**: Generate simple, medium, and long versions of your content.
- **Premium Themes**: 10 modern, animated UI themes.

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   cd ECHOWRITE-1
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Supabase Integration

This project uses Supabase for authentication and edge functions. 
The main edge function `echowrite` handles AI content generation via Google's Gemini API.

### Setting up the Gemini API Key

Store your Gemini API key as a Supabase Secret:
```sh
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

## Technologies Used

- **Vite** & **React**
- **TypeScript**
- **Tailwind CSS** & **shadcn/ui**
- **Supabase** (Auth & Edge Functions)
- **Google Gemini API**
- **Mermaid.js** (for visuals)
