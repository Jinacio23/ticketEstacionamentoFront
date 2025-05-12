import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PrintIcon from "@mui/icons-material/Print";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";
import LanguageIcon from "@mui/icons-material/Language";

import PageHeader from "../../components/common/PageHeader";

const Configuracoes = () => {
  const [settings, setSettings] = useState({
    companyName: "Estacionamento App",
    printerEnabled: true,
    darkMode: false,
    notificationsEnabled: true,
    language: "pt-BR",
    sessionTimeout: 30,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: event.target.type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    // Simulação de salvamento de configurações
    console.log("Configurações salvas:", settings);
    setSnackbar({
      open: true,
      message: "Configurações salvas com sucesso!",
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Personalize as configurações do sistema"
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Configurações" },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <List component="nav">
              <ListItem button selected>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Geral" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <PrintIcon />
                </ListItemIcon>
                <ListItemText primary="Impressora" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <DarkModeIcon />
                </ListItemIcon>
                <ListItemText primary="Aparência" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notificações" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Segurança" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configurações Gerais
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="companyName"
                  label="Nome da Empresa"
                  value={settings.companyName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.printerEnabled}
                      onChange={handleChange}
                      name="printerEnabled"
                      color="primary"
                    />
                  }
                  label="Habilitar Impressora"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={handleChange}
                      name="darkMode"
                      color="primary"
                    />
                  }
                  label="Modo Escuro"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificationsEnabled}
                      onChange={handleChange}
                      name="notificationsEnabled"
                      color="primary"
                    />
                  }
                  label="Habilitar Notificações"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LanguageIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <TextField
                    select
                    name="language"
                    label="Idioma"
                    value={settings.language}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </TextField>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="sessionTimeout"
                  label="Tempo de Inatividade (minutos)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 1, max: 120 },
                  }}
                  helperText="Tempo de inatividade até encerrar a sessão"
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Algumas configurações podem requerer reinicialização do
                  sistema para serem aplicadas.
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    Salvar Configurações
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Configuracoes;
