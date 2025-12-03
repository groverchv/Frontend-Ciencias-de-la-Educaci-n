// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import Header from "./components/Home/header";
import Navbar from "./components/Home/navbar";
import Footer from "./components/Home/footer";
import AppRoutes from "./routes/appRoutes";
import "./App.css";
import bg from "./assets/fondo/fondo.svg";
import DynamicSlider from "./components/Home/DynamicSlider";
import WebSocketService from "./services/WebSocketService";

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLogin = location.pathname === "/login";

  // Conectar WebSocket para páginas públicas (no dashboard, no login)
  useEffect(() => {
    if (!isDashboard && !isLogin) {
      const username = 'visitante-' + Math.random().toString(36).substr(2, 9);
      
      WebSocketService.connect(
        username,
        'other', // Páginas públicas
        () => {
          console.log('WebSocket conectado en página pública');
        },
        (error) => {
          console.error('Error WebSocket en página pública:', error);
        }
      );

      return () => {
        WebSocketService.disconnect();
      };
    }
  }, [isDashboard, isLogin]);

  if (isDashboard) {
    return <AppRoutes />;
  }

  if (isLogin) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ "--app-bg": `url(${bg})` }}>
      <Header />
      <DynamicSlider height="clamp(345px, 38vh, 520px)" fullBleed={false} />
      <Navbar />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
