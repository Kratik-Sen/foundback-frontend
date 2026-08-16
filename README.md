# CampusFind web client

This folder is an independent React/Vite/Tailwind application.

```bash
copy .env.example .env
npm install
npm run dev
```

The development server runs at `http://localhost:5173`. `VITE_API_URL` and `VITE_SOCKET_URL` are configured in this folder's `.env`; the Vite proxy also targets the backend at `http://localhost:8080`.
