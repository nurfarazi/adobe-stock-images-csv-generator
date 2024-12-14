const fs = require("fs-extra");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const sharp = require("sharp");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const analyzeImage = require("./analyzeImages");
const promptText = require("./promptText");

// Enable GPU support in sharp
sharp.cache(false);
sharp.simd(true);
sharp.concurrency(0);

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

async function processImage(file) {
  const filePath = path.join(folderPath, file);
  const ext = path.extname(file);
  const resizedFilePath = path.join(resizedFolderPath, path.basename(file, ext) + ext);
  const fileStartTime = Date.now();

  // Resize down to 10% of original size
  const image = await fs.readFile(filePath);
  const metadata = await sharp(image).metadata();
  const newWidth = Math.round(metadata.width * 0.1);

  if (newWidth > 0) {
    const resizedImage = await sharp(image).resize({ width: newWidth }).toFormat(metadata.format).toBuffer();
    await fs.writeFile(resizedFilePath, resizedImage);
  }

  const analysis = await analyzeImage(resizedFilePath);

  const fileEndTime = Date.now();
  console.log(`✅ ${promptText.processed} ${file} ${promptText.in} ${(fileEndTime - fileStartTime) / 1000}s`);

  return {
    fileName: file,
    title: analysis.title || "",
    keyword: analysis.keywords.join(", ") || "",
    category: analysis.category || "",
    releases: "",
  };
}

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
    const workerPromises = imageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { file }
        });
        worker.on("message", resolve);
        worker.on("error", reject);
      });
    });

    const results = await Promise.all(workerPromises);
    results.forEach((result) => records.push(result));

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

if (isMainThread) {
  async function processImagesInParallel() {
    const startTime = Date.now();
    await processImages();
    const endTime = Date.now();
    console.log(`${promptText.totalExecutionTime}: ${(endTime - startTime) / 1000}s`);
  }

  processImagesInParallel();
} else {
  processImage(workerData.file).then((result) => parentPort.postMessage(result)).catch((error) => parentPort.postMessage({ error: error.message }));
}
