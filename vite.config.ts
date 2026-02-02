import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    base: '/disasterwatch-ai/',
    plugins: [react()],
    define: {
      // By default, Vite doesn't include .env variables in the build unless they start with VITE_
      // This explicitly replaces process.env.API_KEY with the value from the environment/secret
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});