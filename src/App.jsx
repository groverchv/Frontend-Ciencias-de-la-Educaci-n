// src/App.jsx
import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AppRoutes from "./routes/appRoutes";
import "./App.css";
import bg from "./assets/ciencia-de-la-educacion/Ciencias-de-la-Educacion.png";
import DynamicSlider from "./components/DynamicSlider";

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLogin = location.pathname === "/login";

  // Si es Dashboard o Login, no mostrar header/navbar/footer públicos
  if (isDashboard || isLogin) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    );
  }

  // Vista pública normal
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
