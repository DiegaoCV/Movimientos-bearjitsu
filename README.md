{
  "name": "mov.-berjitsu---real-time-inventory-&-sales",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.44.0",
    "@tailwindcss/vite": "^4.2.1",
    "cors": "^2.8.6",
    "express": "^5.2.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "recharts": "^3.8.0",
    "tailwindcss": "^4.2.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "esbuild": "^0.28.0",
    "tsx": "^4.22.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
