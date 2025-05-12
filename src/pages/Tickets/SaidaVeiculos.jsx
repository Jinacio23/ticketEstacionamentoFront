import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { Html5QrcodeScanner } from "html5-qrcode";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import ticketService from "../../services/ticketService";
import {
  formatDateTime,
  formatCurrency,
  calculateDuration,
} from "../../utils/formatters";

// Passos do processo de saída
const steps = ["Leitura do QR Code", "Pagamento", "Liberação"];

// Formas de pagamento disponíveis
const formasPagamento = [
  { valor: "dinheiro", label: "Dinheiro" },
  { valor: "cartao", label: "Cartão de Crédito/Débito" },
  { valor: "pix", label: "PIX" },
];

const SaidaVeiculos = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scanner, setScanner] = useState(null);
  const [qrCodeManual, setQrCodeManual] = useState("");
  const [ticket, setTicket] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [pagamento, setPagamento] = useState(null);

  // Inicializar o scanner de QR Code
  useEffect(() => {
    if (activeStep === 0 && !scanner) {
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
  }, [activeStep]);

  // Limpar o scanner quando mudamos de etapa
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
      // Extrair o token do QR Code
      // Formato esperado: "ticket:1234,token:abc-123-def"
      const tokenMatch = qrCodeData.match(/token:([^,]+)/);

      if (tokenMatch && tokenMatch[1]) {
        handleValidarTicket(tokenMatch[1]);
      } else {
        // Se o formato não corresponder, tenta validar diretamente
        handleValidarTicket(qrCodeData);
      }
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      enqueueSnackbar("Formato de QR Code inválido", { variant: "error" });
    }
  };

  const handleQrCodeManualChange = (event) => {
    setQrCodeManual(event.target.value);
  };

  const handleValidarTicket = async (token) => {
    try {
      setLoading(true);
      const response = await ticketService.validarTicket(token);

      if (response.valid) {
        setTicket(response.ticket);
        enqueueSnackbar("Ticket validado com sucesso", { variant: "success" });
        setActiveStep(1); // Avança para a etapa de pagamento
      } else {
        enqueueSnackbar(`Erro ao validar ticket: ${response.message}`, {
          variant: "error",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao validar ticket:", error);
      enqueueSnackbar(
        "Erro ao validar ticket. Verifique se o QR Code está correto.",
        { variant: "error" }
      );
      setLoading(false);
    }
  };

  const handleFormaPagamentoChange = (event) => {
    setFormaPagamento(event.target.value);
  };

  const handleProcessarPagamento = async () => {
    if (!ticket) return;

    try {
      setLoading(true);
      const response = await ticketService.pagarTicket(
        ticket.qrCodeToken,
        formaPagamento
      );
      setPagamento(response);
      enqueueSnackbar("Pagamento processado com sucesso", {
        variant: "success",
      });
      setActiveStep(2); // Avança para a etapa de liberação
      setLoading(false);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      enqueueSnackbar("Erro ao processar pagamento", { variant: "error" });
      setLoading(false);
    }
  };

  const handleNovoTicket = () => {
    setActiveStep(0);
    setTicket(null);
    setPagamento(null);
    setQrCodeManual("");
    setFormaPagamento("dinheiro");

    // Reinicializar o scanner
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Leitura do QR Code
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Scanner de QR Code
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <div id="qr-reader" style={{ width: "100%" }}></div>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Entrada Manual
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Token do Ticket"
                  value={qrCodeManual}
                  onChange={handleQrCodeManualChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  placeholder="Digite o token do ticket"
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={!qrCodeManual}
                  onClick={() => handleValidarTicket(qrCodeManual)}
                  startIcon={<QrCode2Icon />}
                >
                  Validar Token
                </Button>
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Pagamento
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhes do Ticket
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Estacionamento:</strong>{" "}
                      {ticket?.estacionamento?.nome}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Entrada:</strong>{" "}
                      {formatDateTime(ticket?.hrEntrada)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Saída:</strong> {formatDateTime(ticket?.hrSaida)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Permanência:</strong>{" "}
                      {calculateDuration(ticket?.hrEntrada, ticket?.hrSaida)}
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                      <strong>Valor:</strong> {formatCurrency(ticket?.valor)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pagamento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <TextField
                    select
                    label="Forma de Pagamento"
                    value={formaPagamento}
                    onChange={handleFormaPagamentoChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  >
                    {formasPagamento.map((option) => (
                      <MenuItem key={option.valor} value={option.valor}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleProcessarPagamento}
                    startIcon={<PaymentIcon />}
                  >
                    Processar Pagamento
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        );

      case 2: // Liberação
        return (
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                  />

                  <Typography variant="h4" gutterBottom>
                    Pagamento Confirmado
                  </Typography>

                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    O veículo está liberado para sair
                  </Typography>

                  <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
                    <AlertTitle>Pagamento Processado</AlertTitle>
                    Valor: {formatCurrency(pagamento?.valorPagamento)} - Forma:{" "}
                    {formasPagamento.find(
                      (f) => f.valor === pagamento?.tipoPagamento
                    )?.label || pagamento?.tipoPagamento}
                  </Alert>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleNovoTicket}
                      startIcon={<ArrowBackIcon />}
                    >
                      Novo Ticket
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Saída de Veículos"
        subtitle="Validação de tickets e pagamento"
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Saída de Veículos" },
        ]}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {renderStepContent()}
    </div>
  );
};

export default SaidaVeiculos;
