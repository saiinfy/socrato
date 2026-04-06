import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    const geminiKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
      ? process.env.GEMINI_API_KEY
      : (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
        ? env.GEMINI_API_KEY
        : '';

    const geminiKey2 = (process.env.GEMINI_API_KEY_2 && process.env.GEMINI_API_KEY_2 !== 'MY_GEMINI_API_KEY_2')
      ? process.env.GEMINI_API_KEY_2
      : (env.GEMINI_API_KEY_2 && env.GEMINI_API_KEY_2 !== 'MY_GEMINI_API_KEY_2')
        ? env.GEMINI_API_KEY_2
        : '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiKey2 || geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey2 || geminiKey),
        'process.env.GEMINI_API_KEY_2': JSON.stringify(geminiKey2)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
