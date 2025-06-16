import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  LocalParking as LocalParkingIcon, 
  ConfirmationNumber as ConfirmationNumberIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Payments as PaymentsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountBox
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  {
    text: "Estacionamentos",
    icon: <LocalParkingIcon />,
    path: "/estacionamentos",
  },
  { text: "Usuários", icon: <AccountBox />, path: "/usuarios" },
  { text: "Tickets", icon: <ConfirmationNumberIcon />, path: "/tickets" },
  {
    text: "Entrada de Veículos",
    icon: <QrCodeScannerIcon />,
    path: "/entrada",
  },
  { text: "Saída de Veículos", icon: <PaymentsIcon />, path: "/saida" },
  { text: "Relatórios", icon: <AssessmentIcon />, path: "/relatorios" },
  { text: "Configurações", icon: <SettingsIcon />, path: "/configuracoes" },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAdmin } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) => item.text !== "Usuários" || isAdmin
  );

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "240",
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
