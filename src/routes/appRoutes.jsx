import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import GestionarUsuario from "../pages/Dashboard/PaqueteUsuario/GestionarUsuario";
import GestionarRol from "../pages/Dashboard/PaqueteUsuario/GestionarRol";
import GestionarRolUsuario from "../pages/Dashboard/PaqueteUsuario/GestionarRolUsuario";
import PrivateRoute from "../components/PrivateRoute";
import GestionarMenu from "../pages/Dashboard/PaqueteContenido/GestionarMenu";
import GestionarSub_Menu from "../pages/Dashboard/PaqueteContenido/GestionarSub_Menu";
import GestionarContenido from "../pages/Dashboard/PaqueteContenido/Contenido/GestionarContenido";
import ContentEditor from "../pages/Dashboard/PaqueteContenido/Contenido/ContentEditor";
import GestionarPresentacion from "../pages/Dashboard/GestionarPresentacion";
import GestionarBackup from "../pages/Dashboard/GestionarBackup";
import ContenidoDinamico from "../components/Dashboard/ContenidoDinamico";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio/bienvenido" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="usuarios" element={<GestionarUsuario />} />
        <Route path="menus" element={<GestionarMenu />} />
        <Route path="sub_menus" element={<GestionarSub_Menu />} />
        <Route path="contenido" element={<GestionarContenido />} />
        <Route path="contenido/editar/:contenidoId" element={<ContentEditor />} />
        <Route path="roles" element={<GestionarRol />} />
        <Route path="rol-usuario" element={<GestionarRolUsuario />} />
        <Route path="presentacion" element={<GestionarPresentacion />} />
        <Route path="backup" element={<GestionarBackup />} />
      </Route>

      {/* Ruta dinámica para contenido de bloques - captura cualquier ruta */}
      <Route path="/*" element={<ContenidoDinamico />} />
    </Routes>
  );
}
