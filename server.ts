import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI on the backend
  const apiKey = process.env.GEMINI_API_KEY_2;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Security Headers - Required for the app to run securely in the AI Studio iframe
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors globallogic.com *.globallogic.com;");
    res.setHeader('X-Frame-Options', 'ALLOW-FROM https://globallogic.com/');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // AI Generation Endpoint
  app.post("/api/ai/generate", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API Key 2 is not configured on the server." });
    }

    const { model, contents, config } = req.body;

    try {
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Backend AI Generation Error:", error);
      res.status(error.status || 500).json({ 
        error: error.message || "Failed to generate content",
        details: error.response?.data || error
      });
    }
  });

  // Backend API for token authentication (Example of server-side logic)
  app.post("/api/auth", (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Here you can add real token verification logic (e.g., verify JWT)
    // For now, we'll assume it's valid if it exists
    try {
      // Example: const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ status: "authorized", message: "Token verified successfully" });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    // Server started
  });
}

startServer();
