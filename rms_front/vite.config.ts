import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const apiProtocol = env.VITE_API_PROTOCOL || "http";
    const apiHost = env.VITE_API_HOST || "127.0.0.1";
    const apiPort = env.VITE_API_PORT || "8000";

    const apiTarget = `${apiProtocol}://${apiHost}:${apiPort}`;

    return {
        plugins: [tailwindcss(), react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    followRedirects: true, 
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
        test: {
            environment: 'jsdom',
            setupFiles: './tests/setup.ts',
            globals: true,
            include: ['tests/**/*.{test,spec}.{ts,tsx}'],
        },
    };
});
