import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));  // or serve index.html directly

app.post("/generate", async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;  // assume frontend sends imageUrl

    const response = await fetch("https://api.fal.ai/v1/fal-ai/bytedance/seedream/v4/edit", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        image_urls: [ imageUrl ],
        // you can also include optional params:
        // image_size: "square_hd",
        // num_images: 1,
        // seed: 12345,
        // enable_safety_checker: true,
      })
    });

    const result = await response.json();
    const image_url = result.images?.[0]?.url;
    if (!image_url) throw new Error("No image URL returned");
    res.json({ image_url });
  } catch (err) {
    console.error("Error calling FAL edit:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
