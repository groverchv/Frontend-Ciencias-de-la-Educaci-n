// src/components/dinamic.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ImagenesAPI } from "../services/PresentacionService.js";

/* ========= Helper URLs Google Drive ========= */
function getOptimizedUrl(originalUrl) {
  if (!originalUrl) return "";
  const driveMatch = originalUrl.match(
    /\/d\/([a-zA-Z0-9_-]+)|\?id=([a-zA-Z0-9_-]+)/
  );
  if (
    driveMatch &&
    (originalUrl.includes("drive.google.com") ||
      originalUrl.includes("docs.google.com"))
  ) {
    const fileId = driveMatch[1] || driveMatch[2];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return originalUrl;
}

/* ========= Utilidad ========= */
function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

/* ========= Componente Principal SOLO VISUAL ========= */
export default function DynamicSlider({
  fullBleed = false,
  titleText = "Ciencias de la Educación",
  height = "clamp(345px, 38vh, 520px)",
}) {
  const [presentaciones, setPresentaciones] = useState([]);

  const fetchPresentaciones = async () => {
    try {
      const data = await ImagenesAPI.list();
      setPresentaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPresentaciones([]);
    }
  };

  useEffect(() => {
    fetchPresentaciones();
  }, []);

  function isActive(val) {
    return val === true || val === "true" || val === 1;
  }

  const sources = useMemo(
    () =>
      uniq(
        presentaciones
          .filter((it) => isActive(it.estado))
          .map((img) => getOptimizedUrl(img.url || ""))
      ),
    [presentaciones]
  );

  const css = `
    .fs-wrap { 
      width: 100%; 
      position: relative; 

      /* Fondo oscuro con un ligero degradado azul */
      background: radial-gradient(circle at top left, #1e293b 0, #020617 52%, #020617 100%);
      border-radius: 0; /* <-- sin esquinas redondas en web ni móvil */
      border: 1px solid rgba(15, 23, 42, 0.9);
      box-shadow: 0 22px 55px rgba(0,0,0,0.85); 
      padding: 12px 0; 
      overflow: hidden; 
      min-height: var(--fs-height, 260px);
    }
    .fs-wrap.full-bleed { 
      width: 100vw; 
      left: 50%; 
      right: 50%; 
      margin-left: -50vw; 
      margin-right: -50vw; 
      border-radius: 0; 
    }
    .hero-center { 
      position: absolute; 
      inset: 0; 
      z-index: 8; 
      display: grid; 
      place-items: center; 
      pointer-events: none; 
      padding: 0 2rem; 
    }
    .hero-title { 
      color: #f9fafb; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      text-align: center; 
      line-height: 1.05; 
      font-size: clamp(1.8rem, 7vw, 4.2rem); 
      text-shadow: 0 6px 28px rgba(15, 23, 42, 0.95);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <section
        className={`fs-wrap ${fullBleed ? "full-bleed" : ""}`}
        style={{ "--fs-height": height }}
      >
        <div className="hero-center">
          <h1 className="hero-title">{titleText}</h1>
        </div>

        {sources.length > 0 ? (
          <FilmstripOneRow sources={sources} />
        ) : (
          <div
            style={{
              color: "#e5e7eb",
              background: "rgba(15,23,42,0.9)",
              borderRadius: 0,
              margin: "0 16px",
              border: "1px dashed rgba(148,163,184,0.6)",
              padding: 16,
              minHeight: "calc(var(--fs-height, 260px) - 40px)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <p style={{ margin: 0 }}>No hay imágenes.</p>
          </div>
        )}
      </section>
    </>
  );
}

/* ========= Película Infinita (Filmstrip Loop con efecto "vivo") ========= */
function FilmstripOneRow({ sources }) {
  // Duplicamos una vez para efecto infinito
  const displayItems = [...sources, ...sources];

  // Duración basada en cantidad de imágenes
  const animationDuration = Math.max(sources.length * 8, 16); // mínimo 16s

  const cssAnim = `
    /* Movimiento horizontal tipo carrusel infinito */
    @keyframes marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* Respiración suave de luz/contraste en las imágenes */
    @keyframes film-img-breath {
      0% {
        filter: saturate(1) brightness(1);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.5);
      }
      50% {
        filter: saturate(1.08) brightness(1.05);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.8);
      }
      100% {
        filter: saturate(1.03) brightness(1.02);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.65);
      }
    }

    /* Brillo diagonal tipo reflejo de pantalla */
    @keyframes film-sheen {
      0% {
        transform: translateX(-30%);
        opacity: 0;
      }
      20% {
        opacity: 0.25;
      }
      50% {
        opacity: 0.12;
      }
      100% {
        transform: translateX(130%);
        opacity: 0;
      }
    }

    .filmstrip-container {
      position: relative;
      display: flex; 
      overflow: hidden; 
      user-select: none; 
      width: 100%;
      padding: 0 16px 12px;
      box-sizing: border-box;
      mask-image: linear-gradient(
        to right, 
        transparent, 
        black 6%, 
        black 94%, 
        transparent
      );
      -webkit-mask-image: linear-gradient(
        to right, 
        transparent, 
        black 6%, 
        black 94%, 
        transparent
      );
    }

    /* Capa de brillo animado encima del carrusel */
    .filmstrip-container::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        120deg,
        transparent 0%,
        rgba(248, 250, 252, 0.7) 40%,
        rgba(148, 163, 184, 0.25) 60%,
        transparent 100%
      );
      pointer-events: none;
      mix-blend-mode: screen;
      opacity: 0;
      animation: film-sheen 11s linear infinite;
    }

    .marquee-track {
      display: flex; 
      gap: 16px; 
      width: max-content;
      animation: marquee-scroll ${animationDuration}s linear infinite;
      will-change: transform;
    }

    .film-img {
      height: var(--fs-height, 260px);
      width: auto;
      border-radius: 14px;
      object-fit: cover;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.5);
      opacity: 0.9;
      transition: opacity 0.3s, transform 0.3s, box-shadow 0.3s, filter 0.3s;
      border: 1px solid rgba(148, 163, 184, 0.55);
      background: #020617;
      animation: film-img-breath 9s ease-in-out infinite;
    }

    .film-img:hover { 
      opacity: 1; 
      transform: scale(1.03); 
      z-index: 2; 
      box-shadow: 0 18px 48px rgba(15, 23, 42, 0.9);
    }
  `;

  return (
    <div className="filmstrip-container">
      <style>{cssAnim}</style>
      <div className="marquee-track">
        {displayItems.map((src, i) => (
          <img
            key={i}
            src={src}
            className="film-img"
            alt={`slide-${i}`}
            onError={(e) => (e.target.style.display = "none")}
          />
        ))}
      </div>
    </div>
  );
}
