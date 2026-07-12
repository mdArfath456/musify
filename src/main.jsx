import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { LikesProvider } from "./context/LikesContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LikesProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </LikesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);