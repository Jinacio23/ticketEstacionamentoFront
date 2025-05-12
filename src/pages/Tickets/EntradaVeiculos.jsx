import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useSnackbar } from "notistack";
import QRCode from "qrcode.react";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import estacionamentoService from "../../services/estacionamentoService";
import ticketService from "../../services/ticketService";
import { formatDateTime } from "../../utils/formatters";

const EntradaVeiculos = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [estacionamentoSelecionado, setEstacionamentoSelecionado] =
    useState("");
  const [ticket, setTicket] = useState(null);

  // Carregar estacionamentos
  useEffect(() => {
    const fetchEstacionamentos = async () => {
      try {
        setLoading(true);
        const data = await estacionamentoService.listarEstacionamentos();
        const estacionamentosAtivos = data.filter((est) => est.status);
        setEstacionamentos(estacionamentosAtivos);

        if (estacionamentosAtivos.length > 0) {
          setEstacionamentoSelecionado(estacionamentosAtivos[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar estacionamentos:", error);
        enqueueSnackbar("Erro ao carregar estacionamentos", {
          variant: "error",
        });
        setLoading(false);
      }
    };

    fetchEstacionamentos();
  }, [enqueueSnackbar]);

  // Manipuladores de eventos
  const handleEstacionamentoChange = (event) => {
    setEstacionamentoSelecionado(event.target.value);
    // Ao trocar de estacionamento, limpa o ticket gerado
    setTicket(null);
  };

  const handleGerarTicket = async () => {
    if (!estacionamentoSelecionado) {
      enqueueSnackbar("Selecione um estacionamento", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const novoTicket = await ticketService.gerarTicket(
        estacionamentoSelecionado
      );
      setTicket(novoTicket);
      enqueueSnackbar("Ticket gerado com sucesso", { variant: "success" });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao gerar ticket:", error);
      enqueueSnackbar("Erro ao gerar ticket", { variant: "error" });
      setLoading(false);
    }
  };

  const handleImprimirTicket = () => {
    if (!ticket) return;

    // Abre uma nova janela com o ticket para impressão
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Estacionamento</title>
          <style>
            body { font-family: Arial; margin: 0; padding: 20px; }
            .ticket { border: 1px solid #ccc; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .qrcode { text-align: center; margin: 20px 0; }
            .qrcode img { width: 200px; height: 200px; }
            .info { margin-bottom: 10px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h2>Ticket de Estacionamento</h2>
              <h3>${ticket.estacionamento.nome}</h3>
            </div>
            <div class="qrcode">
              <img src="data:image/png;base64,${ticket.qrCode}" alt="QR Code" />
            </div>
            <div class="info">
              <p><strong>Entrada:</strong> ${formatDateTime(
                ticket.hr_entrada
              )}</p>
              <p><strong>Token:</strong> ${ticket.token.substring(0, 8)}...</p>
            </div>
            <div class="footer">
              <p>Apresente este ticket na saída</p>
              <p>${ticket.estacionamento.endereco}</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopiarToken = () => {
    if (!ticket) return;

    navigator.clipboard
      .writeText(ticket.token)
      .then(() => {
        enqueueSnackbar("Token copiado para a área de transferência", {
          variant: "success",
        });
      })
      .catch(() => {
        enqueueSnackbar("Erro ao copiar token", { variant: "error" });
      });
  };

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Entrada de Veículos"
        subtitle="Gerar tickets para novos veículos"
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Entrada de Veículos" },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gerar Novo Ticket
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <TextField
                select
                label="Estacionamento"
                value={estacionamentoSelecionado}
                onChange={handleEstacionamentoChange}
                fullWidth
                required
                variant="outlined"
                helperText="Selecione o estacionamento para o novo ticket"
              >
                {estacionamentos.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.nome} - {option.endereco}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleGerarTicket}
                disabled={!estacionamentoSelecionado || loading}
              >
                Gerar Ticket
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {ticket ? (
            <Card>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Ticket Gerado
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <QRCode
                    value={ticket.token}
                    size={200}
                    level="H"
                    includeMargin
                    renderAs="svg"
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Estacionamento:</strong>{" "}
                    {ticket.estacionamento.nome}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Entrada:</strong>{" "}
                    {formatDateTime(ticket.hr_entrada)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Token:</strong> {ticket.token.substring(0, 12)}...
                    <IconButton size="small" onClick={handleCopiarToken}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<LocalPrintshopIcon />}
                  onClick={handleImprimirTicket}
                >
                  Imprimir Ticket
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Paper
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                border: "2px dashed #ccc",
              }}
            >
              <Typography variant="h6" color="text.secondary" align="center">
                Gere um novo ticket para visualizá-lo aqui
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

// É necessário adicionar esta linha para exportar o componente como padrão
export default EntradaVeiculos;
