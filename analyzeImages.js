const fs = require("fs").promises;
const fetch = require("node-fetch");
const { prompt } = require("./promptText");

const analyzeImage = async (filePath) => {
  console.log(`Starting analysis for image: ${filePath}`);
  try {
    const imageData = await fs.readFile(filePath);
    console.log(`Image data read successfully for: ${filePath}`);
    const base64Image = imageData.toString("base64");

    // First check if the model is available
    try {
      console.log("Checking available models...");
      const modelsResponse = await fetch("http://localhost:11434/api/tags");
      const modelsData = await modelsResponse.json();
      // console.log('Available models:', modelsData);
    } catch (error) {
      console.error("Error checking models:", error.message);
      throw new Error("Cannot connect to Ollama API");
    }

    // Make the API call to analyze image
    console.log("Sending image for analysis...");
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2-vision:latest",
        prompt: `${prompt.prompt}`,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response received:", data.response);

    // Extract keywords and category from the response
    const analysis = parseResponse(data.response); // Ensure correct data is passed
    console.log(`Analysis for ${filePath}:`, analysis);

    return {
      title: analysis.title,
      keywords: analysis.keywords,
      category: analysis.category,
    };
  } catch (error) {
    console.error(`Error analyzing image (${filePath}):`, error.message);
    return {
      title: "",
      keywords: [],
      category: "Uncategorized",
    };
  }
};

// Helper function to parse the model's response
const parseResponse = (responseText) => {
  try {
    console.log("Parsing response text...");
    // Parse the response text to extract title, keywords, and category
    const text = responseText || "";

    // Extract title
    const titleMatch = text.match(/##Title:\s*(.+?)(?=\s*##|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract keywords
    const keywordsMatch = text.match(/##Keywords:\s*(.+?)(?=\s*##|$)/i);
    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .trim()
          .split(",")
          .map((k) => k.trim())
      : [];

    // Extract category
    const categoryMatch = text.match(/##Category:\s*(.+?)(?=$)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : "Uncategorized";

    console.log("Parsed response:", { title, keywords, category });
    return { title, keywords, category };
  } catch (error) {
    console.error("Error parsing response:", error);
    return { title: "", keywords: [], category: "Uncategorized" };
  }
};

module.exports = analyzeImage;
