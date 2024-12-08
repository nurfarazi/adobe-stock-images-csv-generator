const fs = require("fs").promises;
const fetch = require("node-fetch");
const { prompt, promptForDolphin } = require("./promptText"); // Ensure promptForDolphin is imported

const analyzeImage = async (filePath) => {
  try {
    const imageData = await fs.readFile(filePath);
    const base64Image = imageData.toString("base64");

    // First check if the model is available
    try {
      const modelsResponse = await fetch("http://localhost:11434/api/tags");
      const modelsData = await modelsResponse.json();
      // console.log("✅ Models available:", modelsData);
    } catch (error) {
      console.error("❌ Error checking models:", error.message);
      throw new Error("Cannot connect to Ollama API");
    }

    // Make the API call to analyze image
    console.log("📤 Sending image for analysis...");
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2-vision:latest",
        prompt: `${prompt}`,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`❌ API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📊 Tokens used by llama3.2-vision:", data.tokensUsed || "Not available");

    // Call the second model to get the final structured version
    console.log("📤 Sending data for final structuring...");
    const finalResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dolphin-llama3:latest",
        prompt: `${promptForDolphin} , ${data.response}`,
        stream: false,
      }),
    });

    if (!finalResponse.ok) {
      throw new Error(`❌ Final API call failed: ${finalResponse.statusText}`);
    }

    const finalData = await finalResponse.json();
    console.log("✅ Final API response received:", finalData.response);

    // Extract keywords and category from the final response
    const analysis = parseResponse(finalData.response); // Ensure correct data is passed
    console.log(`🔍 Analysis for ${filePath}:`, analysis);

    return {
      title: analysis.title,
      keywords: analysis.keywords,
      category: analysis.category,
    };
  } catch (error) {
    console.error(`❌ Error analyzing image (${filePath}):`, error.message);
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
