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
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  {
    text: "Estacionamentos",
    icon: <LocalParkingIcon />,
    path: "/estacionamentos",
  },
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
  const drawerWidth = 240;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
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
