import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("Overwhelm backend running with Gemini");
});

app.post("/api/breakdown", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a productivity assistant.

Break the following overwhelming task into 5-10 small actionable steps.

Return ONLY a numbered list.

Task:
${text}
`;

    const result = await model.generateContent(prompt);

    const raw = result.response.text();

    const steps = raw
      .split("\n")
      .map((s) => s.replace(/^\d+[\).\s]*/, "").trim())
      .filter(Boolean);

    res.json({ steps });
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      error: "Failed to generate breakdown",
    });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});