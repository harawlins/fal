// Simple Node.js + Express server for FAL AI image generation
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Serve index.html
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Replace this with the correct endpoint, e.g. "fal-ai/seedream"
    const falModel = "fal-ai/seedream";

    const response = await fetch(`https://api.fal.ai/v1/${falModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();

    // Adjust depending on the actual structure returned by FAL
    const image_url = result.image?.url || result?.images?.[0]?.url;

    res.json({ image_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
