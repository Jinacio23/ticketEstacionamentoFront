import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, CssBaseline, useTheme } from "@mui/material";
import { useAppContext } from "../../contexts/AppContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = ({ toggleDarkMode }) => {
  const theme = useTheme();
  const location = useLocation();
  const { carregarEstacionamentos } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [title, setTitle] = useState("Dashboard");

  // Carregar estacionamentos ao montar o componente
  useEffect(() => {
    carregarEstacionamentos();
  }, [carregarEstacionamentos]);

  // Atualizar título baseado na rota atual
  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setTitle("Dashboard");
    } else if (path.includes("estacionamentos")) {
      setTitle("Estacionamentos");
    } else if (
      path.includes("tickets") ||
      path === "/entrada" ||
      path === "/saida"
    ) {
      setTitle("Tickets");
    } else if (path.includes("relatorios")) {
      setTitle("Relatórios");
    } else if (path.includes("configuracoes")) {
      setTitle("Configurações");
    } else if (path.includes("qrcode-scan")) {
      setTitle("Escanear QR Code");
    }
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        title={title}
        toggleDarkMode={toggleDarkMode}
      />
      <Sidebar open={isSidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          transition: theme.transitions.create(["margin", "background-color"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isSidebarOpen ? "240px" : 0,
          bgcolor: theme.palette.background.default,
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
