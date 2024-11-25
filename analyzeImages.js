const fs = require("fs").promises;
const fetch = require("node-fetch");

const analyzeImage = async (filePath) => {
  try {
    const imageData = await fs.readFile(filePath);
    const base64Image = imageData.toString("base64");

    // First check if the model is available
    try {
      const modelsResponse = await fetch("http://localhost:11434/api/tags");
      const modelsData = await modelsResponse.json();
      // console.log('Available models:', modelsData);
    } catch (error) {
      console.error("Error checking models:", error.message);
      throw new Error("Cannot connect to Ollama API");
    }

    // Make the API call to analyze image
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2-vision:11b",
        prompt:
          'Provide a description (max 200 characters) of what the asset represents in the format "Title: description", keywords (max 50) in the format "Keywords: word1, word2, word3, ...", and category in the format "Category: categoryName". Do not say anything else.',
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    //console.log("API response:", data.response);

    // Extract keywords and category from the response
    const analysis = parseResponse(data.response); // Ensure correct data is passed
    // console.log(`Analysis for ${filePath}:`, analysis);

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
    // Parse the response text to extract title, keywords, and category
    const text = responseText || "";

    // Extract title
    const titleMatch = text.match(/Title:\s*(.+?)(?=Keywords:|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract keywords
    const keywordsMatch = text.match(/Keywords:\s*(.+?)(?=Category:|$)/i);
    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .trim()
          .split(",")
          .map((k) => k.trim())
      : [];

    // Extract category
    const categoryMatch = text.match(/Category:\s*(.+?)(?=$)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : "Uncategorized";

    return { title, keywords, category };
  } catch (error) {
    console.error("Error parsing response:", error);
    return { title: "", keywords: [], category: "Uncategorized" };
  }
};
module.exports = analyzeImage;
