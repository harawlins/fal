import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// === FAL Seedream 4.0 Edit endpoint ===
app.post("/generate", async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;

    if (!prompt || !imageUrl) {
      return res.status(400).json({ error: "Missing prompt or imageUrl" });
    }

    const response = await fetch("https://api.fal.ai/v1/fal-ai/bytedance/seedream/v4/edit", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        image_urls: [imageUrl],
        image_size: "square_hd"
      })
    });

    const data = await response.json();

    // Log for debugging (you can check this in Render logs)
    console.log("FAL API response:", JSON.stringify(data, null, 2));

    // Handle any FAL error response
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || data.message || JSON.stringify(data)
      });
    }

    const image_url = data.images?.[0]?.url;
    if (!image_url) {
      return res.status(500).json({ error: "No image URL returned from FAL" });
    }

    res.json({ image_url });
  } catch (err) {
    console.error("Error calling FAL edit:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
