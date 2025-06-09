import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; 
import logger from './services/logging';
import './i18n';

logger.info('Iniciando aplicación');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


