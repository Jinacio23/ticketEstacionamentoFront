import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { Html5QrcodeScanner } from "html5-qrcode";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import ticketService from "../../services/ticketService";

const QrCodeScan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [qrCodeManual, setQrCodeManual] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanType, setScanType] = useState(
    location.state?.scanType || "ticket"
  );
  const [nextAction, setNextAction] = useState(
    location.state?.nextAction || ""
  );

  // Inicializar o scanner de QR Code
  useEffect(() => {
    if (!scanner) {
      const newScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      newScanner.render(
        (qrCodeMessage) => {
          handleQrCodeDetected(qrCodeMessage);
        },
        (error) => {
          console.error("QR Code scan error:", error);
        }
      );

      setScanner(newScanner);

      return () => {
        if (newScanner) {
          newScanner.clear();
        }
      };
    }
  }, []);

  // Limpar o scanner ao desmontar o componente
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  // Manipuladores de eventos
  const handleQrCodeDetected = async (qrCodeData) => {
    try {
      setLoading(true);

      // Extrair o token do QR Code
      // Formato esperado: "ticket:1234,token:abc-123-def"
      let token = qrCodeData;
      const tokenMatch = qrCodeData.match(/token:([^,]+)/);

      if (tokenMatch && tokenMatch[1]) {
        token = tokenMatch[1];
      }

      // Simular processamento do QR Code
      if (scanType === "ticket") {
        try {
          const response = await ticketService.validarTicket(token);

          if (response.valid) {
            setScanResult({
              success: true,
              message: "Ticket validado com sucesso",
              data: response.ticket,
            });
            enqueueSnackbar("Ticket validado com sucesso", {
              variant: "success",
            });
          } else {
            setScanResult({
              success: false,
              message: response.message || "Erro ao validar ticket",
              data: null,
            });
            enqueueSnackbar("Erro ao validar ticket", { variant: "error" });
          }
        } catch (error) {
          setScanResult({
            success: false,
            message: "Erro ao processar ticket",
            data: null,
          });
          enqueueSnackbar("Erro ao processar ticket", { variant: "error" });
        }
      } else {
        // Outros tipos de QR Code
        setScanResult({
          success: true,
          message: "QR Code lido com sucesso",
          data: { token },
        });
        enqueueSnackbar("QR Code lido com sucesso", { variant: "success" });
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      setScanResult({
        success: false,
        message: "Erro ao processar QR Code",
        data: null,
      });
      enqueueSnackbar("Erro ao processar QR Code", { variant: "error" });
      setLoading(false);
    }
  };

  const handleQrCodeManualChange = (event) => {
    setQrCodeManual(event.target.value);
  };

  const handleValidarManual = () => {
    if (!qrCodeManual) {
      enqueueSnackbar("Digite um token válido", { variant: "warning" });
      return;
    }

    handleQrCodeDetected(qrCodeManual);
  };

  const handleContinuar = () => {
    if (nextAction) {
      navigate(nextAction, { state: { scanResult } });
    } else {
      navigate("/saida", { state: { scanResult } });
    }
  };

  const handleVoltar = () => {
    scanner?.clear();
    setScanResult(null);
    setQrCodeManual("");
  };

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Escanear QR Code"
        subtitle={
          scanType === "ticket"
            ? "Escaneie o QR Code do ticket"
            : "Escaneie o QR Code"
        }
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Escanear QR Code" },
        ]}
      />

      {!scanResult ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scanner de QR Code
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ width: "100%", mb: 3 }}>
                <div id="qr-reader" style={{ width: "100%" }}></div>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  Posicione o QR Code em frente à câmera para escaneá-lo
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Entrada Manual
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <TextField
                  label="Token do QR Code"
                  value={qrCodeManual}
                  onChange={handleQrCodeManualChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Digite o token do QR Code"
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleValidarManual}
                  disabled={!qrCodeManual}
                  startIcon={<QrCode2Icon />}
                >
                  Validar Token
                </Button>

                <Box sx={{ mt: 4, flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Se não for possível escanear o QR Code, digite o token
                    manualmente no campo acima.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {scanResult.success ? (
                <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
              ) : (
                <QrCode2Icon sx={{ fontSize: 80, color: "error.main" }} />
              )}

              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                {scanResult.success ? "QR Code Validado" : "Erro na Validação"}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {scanResult.message}
              </Typography>
            </Box>

            {scanResult.success && scanResult.data && (
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Detalhes:
                </Typography>

                {scanType === "ticket" && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ticket ID:
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.data.idTicket}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estacionamento:
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.data.estacionamento?.nome || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Entrada:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(scanResult.data.hrEntrada).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.data.pago ? "Pago" : "Pendente"}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {scanType !== "ticket" && (
                  <Typography variant="body1">
                    Token: {scanResult.data.token}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
            <Button variant="outlined" onClick={handleVoltar}>
              Voltar
            </Button>

            {scanResult.success && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleContinuar}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Continuar
              </Button>
            )}
          </CardActions>
        </Card>
      )}
    </div>
  );
};

export default QrCodeScan;
