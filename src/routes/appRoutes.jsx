import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import GestionarUsuario from "../pages/Dashboard/GestionarUsuario";
import PrivateRoute from "../components/PrivateRoute";
import GestionarMenu from "../pages/Dashboard/GestionarMenu";
import GestionarSub_Menu from "../pages/Dashboard/GestionarSub_Menu";
import GestionarContenido from "../pages/Dashboard/GestionarContenido";
import GestionarRol from "../pages/Dashboard/GestionarRol";
import GestionarPermiso from "../pages/Dashboard/GestionarPermiso";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

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
        <Route path="roles" element={<GestionarRol />} />
        <Route path="permisos" element={<GestionarPermiso />} />
      </Route>
    </Routes>
  );
}
