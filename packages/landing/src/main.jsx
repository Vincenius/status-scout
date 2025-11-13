import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App.jsx";
import { CookieManager } from "react-cookie-manager";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CookieManager>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookieManager>
  </React.StrictMode>
);
