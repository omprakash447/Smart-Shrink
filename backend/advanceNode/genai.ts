import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";

// ✅ Use your actual API key from https://makersuite.google.com/app/apikey
const genAI = new GoogleGenerativeAI("AIzaSyCXSJ1XzZ85mLSEgVnW8ZHGfoFH7aVPM_0");

const app = express();

app.get("/gen-ai", async (_req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ✅ Works with SDK v1+
    const result = await model.generateContent("who is the pm of india former");
    const response = result.response;
    const text = await response.text();

    res.status(200).send(`
         <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>AI Response</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            margin: 40px;
            color: #333;
            line-height: 1.6;
          }
          .container {
            background: white;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px 40px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          h1 {
            color: #007bff;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.1rem;
            white-space: pre-wrap; /* preserve line breaks */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AI Generated Answer</h1>
          <p>${text}</p>
        </div>
      </body>
      </html>
        `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Gemini API error: " + error);
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
