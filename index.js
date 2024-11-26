const fs = require("fs-extra");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const sharp = require("sharp");
const analyzeImage = require("./analyzeImages");

const folderPath = "./images"; // Change this to your folder path
const resizedFolderPath = "./resized-images"; // New folder for resized images
const maxLines = 5000;
const maxFileSize = 5 * 1024 * 1024; // 5MB

const csvWriter = createObjectCsvWriter({
  path: "output.csv",
  header: [
    { id: "fileName", title: "Filename" },
    { id: "title", title: "Title" },
    { id: "keyword", title: "Keywords" },
    { id: "category", title: "Category" },
    { id : "releases", title: "Releases" },
  ],
});

const startTime = Date.now();

async function processImages() {
  try {
    console.log("Starting image processing...");

    // Check if the folder exists
    const folderExists = await fs.access(folderPath).then(() => true).catch(() => false);
    if (!folderExists) {
      console.error(`Folder not found: ${folderPath}`);
      return;
    }
    console.log(`Folder found: ${folderPath}`);

    // Create the resized images folder if it doesn't exist
    await fs.ensureDir(resizedFolderPath);
    console.log(`Resized images folder ensured: ${resizedFolderPath}`);

    const files = await fs.readdir(folderPath);
    console.log(`Files read from folder: ${files.length} files found`);

    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    console.log(`Image files filtered: ${imageFiles.length} image files found`);

    const records = [];

    await Promise.all(imageFiles.map(async (file) => {
      console.log(`Processing file: ${file}`);
      const filePath = path.join(folderPath, file);
      const resizedFilePath = path.join(resizedFolderPath, file); // New path for resized image
      const fileStartTime = Date.now();

      // Resize down to 10% of original size
      const image = await fs.readFile(filePath);
      const metadata = await sharp(image).metadata();
      const newWidth = Math.round(metadata.width * 0.5);

      if (newWidth > 0) {
        const resizedImage = await sharp(image).resize({ width: newWidth }).toBuffer();
        await fs.writeFile(resizedFilePath, resizedImage); // Write to new path
        console.log(`Resized image written: ${resizedFilePath}`);
      } else {
        console.warn(`Skipping resize for ${file} due to invalid width.`);
      }

      const analysis = await analyzeImage(resizedFilePath); // Analyze the resized image
      console.log(`Image analyzed: ${file}`);

      records.push({
        fileName: file,
        title: analysis.title || "",
        keyword: analysis.keywords.join(", ") || "", // Use metadata.keywords
        category: analysis.category || "",
        releases:  "",
      });

      const fileEndTime = Date.now();
      console.log(`Processed ${file} in ${fileEndTime - fileStartTime}ms`);
    }));

    console.log("Writing records to CSV...");
    await csvWriter.writeRecords(records);
    console.log("CSV file written.");

    const stats = await fs.stat("output.csv");
    if (stats.size > maxFileSize) {
      console.error("CSV file exceeds the maximum file size of 5MB.");
    } else {
      console.log("CSV file created successfully.");
    }
  } catch (error) {
    console.error("Error processing images:", error);
  }
}

processImages().then(() => {
  const endTime = Date.now();
  console.log(`Total execution time: ${endTime - startTime}ms`);
});
