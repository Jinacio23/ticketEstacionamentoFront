import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Certifique-se de que o elemento root existe
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Não foi possível encontrar o elemento com id "root"');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
