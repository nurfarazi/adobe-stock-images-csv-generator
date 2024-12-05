const fs = require("fs-extra");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const sharp = require("sharp");
const analyzeImage = require("./analyzeImages");
const promptText = require("./promptText");

const folderPath = "./images"; // Change this to your folder path
const resizedFolderPath = "./resized-images"; // New folder for resized images
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
    console.log(promptText.startingImageProcessing);

    // Check if the folder exists
    const folderExists = await fs.access(folderPath).then(() => true).catch(() => false);
    if (!folderExists) {
      console.error(`${promptText.folderNotFound}: ${folderPath}`);
      return;
    }

    // Create the resized images folder if it doesn't exist
    await fs.ensureDir(resizedFolderPath);
    console.log(`${promptText.resizedImagesFolderEnsured}: ${resizedFolderPath}`);

    const files = await fs.readdir(folderPath);
    console.log(`${promptText.filesReadFromFolder}: ${files.length} ${promptText.filesFound}`);

    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    console.log(`${promptText.imageFilesFiltered}: ${imageFiles.length} ${promptText.imageFilesFound}`);

    const records = [];

    await Promise.all(imageFiles.map(async (file) => {
      console.log(`${promptText.processingFile}: ${file}`);
      const filePath = path.join(folderPath, file);
      const ext = path.extname(file); // Get the file extension
      const resizedFilePath = path.join(resizedFolderPath, path.basename(file, ext) + ext); // New path for resized image with original extension
      const fileStartTime = Date.now();

      // Resize down to 10% of original size
      const image = await fs.readFile(filePath);
      const metadata = await sharp(image).metadata();
      const newWidth = Math.round(metadata.width * 0.1);

      if (newWidth > 0) {
        const resizedImage = await sharp(image).resize({ width: newWidth }).toFormat(metadata.format).toBuffer(); // Keep original format
        await fs.writeFile(resizedFilePath, resizedImage); // Write to new path
        console.log(`${promptText.resizedImageWritten}: ${resizedFilePath}`);
      } else {
        console.warn(`${promptText.skippingResize}: ${file} ${promptText.invalidWidth}`);
      }

      const analysis = await analyzeImage(resizedFilePath); // Analyze the resized image
      console.log(`${promptText.imageAnalyzed}: ${file}`);

      records.push({
        fileName: file,
        title: analysis.title || "",
        keyword: analysis.keywords.join(", ") || "", // Use metadata.keywords
        category: analysis.category || "",
        releases:  "",
      });

      const fileEndTime = Date.now();
      console.log(`✅ ${promptText.processed} ${file} ${promptText.in} ${(fileEndTime - fileStartTime) / 1000}s`);
    }));

    await csvWriter.writeRecords(records);

    const stats = await fs.stat("output.csv");
    if (stats.size > maxFileSize) {
      console.error(promptText.csvFileExceedsMaxSize);
    } else {
      console.log(promptText.csvFileCreatedSuccessfully);
    }
  } catch (error) {
    console.error(`${promptText.errorProcessingImages}:`, error);
  }
}

async function processImagesInParallel() {
  const startTime = Date.now();
  await processImages();
  const endTime = Date.now();
  console.log(`${promptText.totalExecutionTime}: ${(endTime - startTime) / 1000}s`);
}

processImagesInParallel();
