import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import MessageBubble from "./components/MessageBubble"; // ← добавь эту строку

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <MessageBubble url={import.meta.env.VITE_N8N_WEBHOOK_URL} /> {/* ← и это */}
  </>
);
