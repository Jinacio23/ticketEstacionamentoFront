import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ptBR } from "@mui/material/locale";

// Contexto
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";

// Layout
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Estacionamentos from "./pages/Estacionamentos/Estacionamentos";
import EstacionamentoForm from "./pages/Estacionamentos/EstacionamentoForm";
import Tickets from "./pages/Tickets/Tickets";
import EntradaVeiculos from "./pages/Tickets/EntradaVeiculos";
import SaidaVeiculos from "./pages/Tickets/SaidaVeiculos";
import QrCodeScan from "./pages/QrCodeScan/QrCodeScan";
import Relatorios from "./pages/Relatorios/Relatorios";
import Configuracoes from "./pages/Configuracoes/Configuracoes";
import NotFound from "./pages/NotFound/NotFound";
import Login from "./pages/Login/login";
import Usuarios from "./pages/Usuarios/Usuarios";
import UsuarioForm from "./pages/Usuarios/UsuarioForm";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Tema personalizado com suporte a modo escuro
  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
              main: "#1976d2",
            },
            secondary: {
              main: "#dc004e",
            },
            background: {
              default: darkMode ? "#121212" : "#f5f5f5",
              paper: darkMode ? "#1e1e1e" : "#ffffff",
            },
          },
          typography: {
            fontFamily: [
              "Roboto",
              '"Helvetica Neue"',
              "Arial",
              "sans-serif",
            ].join(","),
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: 4,
                },
              },
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  borderRadius: 8,
                },
              },
            },
          },
        },
        ptBR
      ),
    [darkMode]
  );

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            autoHideDuration={4000}
          >
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout toggleDarkMode={() => setDarkMode(!darkMode)} />
                    </ProtectedRoute>
                  }
                >

                  <Route index element={<Dashboard />} />
                  <Route path="/estacionamentos" element={<Estacionamentos />} />
                  <Route
                    path="/estacionamentos/novo"
                    element={<EstacionamentoForm />}
                  />
                  <Route
                    path="/estacionamentos/editar/:id"
                    element={<EstacionamentoForm />}
                  />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/entrada" element={<EntradaVeiculos />} />
                  <Route path="/saida" element={<SaidaVeiculos />} />
                  <Route path="/qrcode-scan" element={<QrCodeScan />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/usuarios/novo" element={<UsuarioForm />} />
                  <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
