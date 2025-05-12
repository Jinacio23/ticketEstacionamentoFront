import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import QrCodeIcon from "@mui/icons-material/QrCode";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import StatusBadge from "../../components/common/StatusBadge";
import estacionamentoService from "../../services/estacionamentoService";
import ticketService from "../../services/ticketService";
import {
  formatDateTime,
  formatCurrency,
  formatTimeAgo,
  calculateDuration,
} from "../../utils/formatters";

const Tickets = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [estacionamentoSelecionado, setEstacionamentoSelecionado] =
    useState("");

  // Carregar estacionamentos
  useEffect(() => {
    const fetchEstacionamentos = async () => {
      try {
        const data = await estacionamentoService.listarEstacionamentos();
        setEstacionamentos(data.filter((est) => est.status));
        if (data.length > 0) {
          setEstacionamentoSelecionado(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar estacionamentos:", error);
        enqueueSnackbar("Erro ao carregar estacionamentos", {
          variant: "error",
        });
      }
    };

    fetchEstacionamentos();
  }, [enqueueSnackbar]);

  // Carregar tickets conforme o estacionamento e tab selecionados
  useEffect(() => {
    const fetchTickets = async () => {
      if (!estacionamentoSelecionado) return;

      try {
        setLoading(true);

        let data;
        if (tabValue === 0) {
          // Todos
          data = await ticketService.listarTicketsPorEstacionamento(
            estacionamentoSelecionado
          );
        } else if (tabValue === 1) {
          // Ativos
          data = await ticketService.listarTicketsAtivos(
            estacionamentoSelecionado
          );
        }

        setTickets(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar tickets:", error);
        enqueueSnackbar("Erro ao carregar tickets", { variant: "error" });
        setLoading(false);
      }
    };

    fetchTickets();
  }, [estacionamentoSelecionado, tabValue, enqueueSnackbar]);

  // Manipuladores de eventos
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEstacionamentoChange = (event) => {
    setEstacionamentoSelecionado(event.target.value);
  };

  const handlePrintTicket = (ticket) => {
    // Simulação de impressão - abriria uma nova janela com o ticket para impressão
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Estacionamento</title>
          <style>
            body { font-family: Arial; margin: 0; padding: 20px; }
            .ticket { border: 1px solid #ccc; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
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
            <div class="info">
              <p><strong>Entrada:</strong> ${formatDateTime(
                ticket.hrEntrada
              )}</p>
              <p><strong>Ticket:</strong> ${ticket.idTicket}</p>
              <p><strong>Status:</strong> ${ticket.pago ? "Pago" : "Aberto"}</p>
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

  // Configuração do DataGrid
  const columns = [
    { field: "idTicket", headerName: "ID", width: 70 },
    {
      field: "hrEntrada",
      headerName: "Entrada",
      width: 180,
      valueFormatter: (params) => formatDateTime(params.value),
    },
    {
      field: "hrSaida",
      headerName: "Saída",
      width: 180,
      valueFormatter: (params) =>
        params.value ? formatDateTime(params.value) : "-",
    },
    {
      field: "permanencia",
      headerName: "Permanência",
      width: 140,
      valueGetter: (params) => {
        if (!params.row.hrEntrada || !params.row.hrSaida) return "";
        return calculateDuration(params.row.hrEntrada, params.row.hrSaida);
      },
    },
    {
      field: "valor",
      headerName: "Valor",
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      align: "right",
      headerAlign: "right",
    },
    {
      field: "pago",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value} type="pago" />,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handlePrintTicket(params.row)}
            color="primary"
            size="small"
          >
            <PrintIcon fontSize="small" />
          </IconButton>

          {!params.row.pago && !params.row.hrSaida && (
            <IconButton color="secondary" size="small">
              <QrCodeIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Tickets"
        subtitle="Gerenciamento de tickets de estacionamento"
        breadcrumbs={[{ text: "Dashboard", link: "/" }, { text: "Tickets" }]}
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            select
            label="Estacionamento"
            value={estacionamentoSelecionado}
            onChange={handleEstacionamentoChange}
            variant="outlined"
            sx={{ minWidth: 300, mr: 2 }}
          >
            {estacionamentos.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            placeholder="Buscar ticket..."
            variant="outlined"
            size="small"
            sx={{ ml: "auto" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="ticket tabs"
          >
            <Tab label="Todos os Tickets" id="tab-0" />
            <Tab label="Tickets Ativos" id="tab-1" />
          </Tabs>
        </Box>

        <Box sx={{ height: "calc(100vh - 350px)", width: "100%" }}>
          <DataGrid
            rows={tickets}
            getRowId={(row) => row.idTicket}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection={false}
            disableSelectionOnClick
            density="standard"
            autoHeight={false}
            loading={loading}
          />
        </Box>
      </Paper>
    </div>
  );
};

export default Tickets;
