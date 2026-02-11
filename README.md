# [Host Hunt](https://host-hunt.vercel.app)

<div align="center">
  <img src="https://raw.githubusercontent.com/TheAmanM/host-hunt/refs/heads/main/banner.png" alt="Vite Logo">
</div>
<p><em>Fastest way to figure out where shit's being hosted.</em></p>

## Problem & Solution

Have you ever tried to reverse engineer a website hosting provider? It's a pain in the ass. Wouldn't it be nice if you could type in [example.com](example.com) and it just.. works?

[Host Hunt](https://host-hunt.vercel.app) is a modern and open-source client-side tool that allows you to determine the hosting provider of any website. Just type it in, Host Hunt handles the rest.

## Contribution

Contributions are welcome! If you have a suggestion or find a bug, please open an issue. If you want to contribute code, please fork the repository and open a pull request.

### Adding a New Provider

To add a new hosting provider, you need to add a new entry to the `HOSTING_SIGNATURES` array in `src/constants/signatures.ts`. Each entry should include the following:

- id
- name
- color
- icon
- patterns

### Development

To run the project locally, you need to have Node.js and npm installed.

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/TheAmanM/host-hunt.git
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
