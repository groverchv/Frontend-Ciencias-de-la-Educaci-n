// src/components/sidebar.jsx
// (Tu archivo 'navegacion izquierda de componentes')

import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, Menu, Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../services/MenuService.js';
import Sub_MenuService from '../../services/Sub_MenuService.js';
import * as Icons from '@ant-design/icons';

// 1. El componente recibe 'open' y 'onClose' como props desde header.jsx
// (Renombrado a PascalCase "Sidebar" por convención de React)
export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  // --- 2. TODA LA LÓGICA DE CARGA DE DATOS ESTÁ AQUÍ ---
  const [menus, setMenus] = useState([]);
  const [subMenus, setSubMenus] = useState([]);
  const [loading, setLoading] = useState(true); // Carga por defecto
  const [error, setError] = useState(null);

  useEffect(() => {
    // Optimización: Solo carga los datos si el menú se abre
    // y si no se han cargado ya.
    if (open && menus.length === 0) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          const [menusResponse, subMenusResponse] = await Promise.all([
            MenuService.getAllMenus(),
            Sub_MenuService.getAllSubMenu(),
          ]);

          setMenus(menusResponse.filter(m => m.estado === true));
          setSubMenus(subMenusResponse.filter(s => s.estado === true));

        } catch (err) {
          console.error("Error al cargar menús del sidebar:", err);
          setError(err.message || "No se pudieron cargar los datos del menú.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open, menus.length]); // Depende de 'open' para iniciar la carga

  // --- 3. LÓGICA PARA PROCESAR LOS DATOS ---
  const processedMenuItems = useMemo(() => {
    const sortedMenus = [...menus].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const subMenuMap = subMenus.reduce((acc, sub) => {
      const menuId = sub.menu_id?.id;
      if (!menuId) return acc;
      if (!acc[menuId]) acc[menuId] = [];
      acc[menuId].push(sub);
      return acc;
    }, {});

    return sortedMenus.map((menu) => {
      const relatedSubMenus = subMenuMap[menu.id] || [];
      const sortedSubMenus = relatedSubMenus.sort((a, b) => (a.orden || 0) - (b.orden || 0));

      return {
        id: menu.id,
        nombre: menu.titulo,
        ruta: menu.ruta,
        icono: menu.icono,
        subMenus: sortedSubMenus.map((sub) => ({
          id: sub.id,
          nombre: sub.titulo,
          ruta: sub.ruta,
          icono: sub.icono,
        })),
      };
    });
  }, [menus, subMenus]);

  // --- 4. FUNCIONES HELPER (COPIADAS DE HEADER) ---
  const getIcon = (iconName) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

  const convertToAntdMenu = (menus) => {
    return menus.map((menu) => {
      const item = {
        key: menu.ruta || menu.id.toString(),
        label: menu.nombre,
        icon: getIcon(menu.icono),
      };
      if (menu.subMenus && menu.subMenus.length > 0) {
        item.children = convertToAntdMenu(menu.subMenus);
      }
      return item;
    });
  };

  const handleMenuClick = ({ key }) => {
    if (typeof key === "string" && key.startsWith("/")) {
      navigate(key);
      onClose(); // Llama a la función 'onClose' del prop para cerrar el Drawer
    }
  };

  // --- 5. RENDERIZAR EL DRAWER ---
  return (
    <Drawer
      className="app-drawer"
      title="Menú"
      placement="left"
      open={open}       // Controlado por el prop 'open'
      onClose={onClose}  // Controlado por el prop 'onClose'
      width={300}
      styles={{ body: { padding: 0 } }}
      zIndex={1200}
      maskClosable
      keyboard
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Alert message={`Error: ${error}`} type="error" showIcon />
        </div>
      ) : processedMenuItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
          <p>No hay menús disponibles</p>
          <p style={{ fontSize: "12px" }}>
            Los administradores pueden crear menús desde el Dashboard
          </p>
        </div>
      ) : (
        <Menu
          mode="inline"
          style={{ borderRight: 0 }}
          items={convertToAntdMenu(processedMenuItems)}
          selectable={false}
          onClick={handleMenuClick}
        />
      )}
    </Drawer>
  );
}