import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <div style={{
      position:"fixed", right:16, bottom:16, background:"#fff",
      padding:12, borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,.15)", zIndex:9999
    }}>
      Тестовый бабл
    </div>
  </React.StrictMode>
);
