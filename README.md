<div align="center">
  <img src="https://raw.githubusercontent.com/TheAmanM/host-hunt/refs/heads/main/README-image.png" alt="Vite Logo">
  <h1>Host Hunt</h1>
  <p>A modern and privacy-first hosting provider detection tool.</p>
</div>

## Problem

Have you ever wondered where a website is hosted? While there are many tools available to find this information, they are often cluttered with ads, trackers, and outdated interfaces. This makes a simple task feel cumbersome and unpleasant.

## Solution

Host Hunt is a modern, open-source, and privacy-first tool that allows you to quickly and easily determine the hosting provider of any website. It's built with a clean and minimal interface, and it doesn't use any trackers or ads. Host Hunt is designed to be a simple and effective tool for a simple task.

## Features

- **Modern Interface**: A clean and minimal interface that is easy to use.
- **Privacy-First**: No trackers or ads. Your searches are your own.
- **Open Source**: The code is available on GitHub for anyone to inspect and contribute to.
- **Accurate**: Host Hunt uses a comprehensive set of signatures to accurately detect hosting providers.
- **Fast**: The tool is built with modern web technologies to be as fast as possible.

## Usage

To use Host Hunt, simply enter the URL of the website you want to check and click the "Hunt" button. The tool will then analyze the website's DNS records and display the hosting provider.

1.  **Enter a URL**: Type or paste the URL of the website you want to check into the input field.
2.  **Click "Hunt"**: Click the arrow button to start the analysis.
3.  **View Results**: The hosting provider will be displayed, along with other relevant information.

## Contribution

Contributions are welcome! If you have a suggestion or find a bug, please open an issue. If you want to contribute code, please fork the repository and open a pull request.

### Adding a New Provider

To add a new hosting provider, you need to add a new entry to the `HOSTING_SIGNATURES` array in `src/constants/signatures.ts`. Each entry should include the following:

- `id`: A unique identifier for the provider.
- `name`: The name of the provider.
- `color`: A background color for the provider's card.
- `icon`: The path to the provider's icon.
- `patterns`: An array of strings that are unique to the provider's DNS records.

### Development

To run the project locally, you need to have Node.js and npm installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/host-hunt.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```

This will start the development server at `http://localhost:5173`.

## License

This project is licensed under the MIT License.
