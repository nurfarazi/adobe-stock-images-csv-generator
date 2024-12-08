# Adobe Stock Images CSV Generator

This project is a tool to generate CSV files for Adobe Stock images. It helps streamline the process of managing and uploading images to Adobe Stock.

## Features

- Generate CSV files with image metadata
- Easy to use interface
- Supports bulk image processing
- **New**: Image analysis using Ollama API

## Installation

1. Clone the repository:

   ```sh
   git clone <repo>
   ```

2. Navigate to the project directory:

   ```sh
   cd adobe-stock-images-csv-generator
   ```

3. Install the dependencies:

   ```sh
   npm install
   ```

## Usage

1. Place your images in the `images` folder.
2. Run the generator script:

   ```sh
   node index.js
   ```

3. The generated CSV file will be saved in the `output` folder.
4. **Optional**: If you have set up the Ollama API, the script will also analyze the images and include additional metadata in the CSV file.

## Ollama Setup

To use the image analysis feature, you need to set up the Ollama API and ensure the vision model is available.

1. **Install Ollama API**: Follow the instructions on the [Ollama API documentation](https://ollama.com/docs) to install and set up the API on your local machine.

2. **Start the Ollama API**: Ensure the Ollama API is running on `http://localhost:11434`.

3. **Load the Vision Model**: The script uses the `llama3.2-vision:11b` model. Make sure this model is available and loaded in your Ollama API setup.

4. **Check Available Models**: You can check the available models by making a GET request to `http://localhost:11434/api/tags`. The script includes a check for available models before analyzing the image.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
