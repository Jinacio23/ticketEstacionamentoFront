import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
// Importações corretas para DatePicker e Adapter (versão mais recente do MUI)
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ptBR } from "date-fns/locale";
import { useSnackbar } from "notistack";
import DescriptionIcon from "@mui/icons-material/Description";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import estacionamentoService from "../../services/estacionamentoService";
import ticketService from "../../services/ticketService";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
} from "../../utils/formatters";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Relatorios = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [estacionamentoSelecionado, setEstacionamentoSelecionado] =
    useState("");
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [dataFim, setDataFim] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [relatorioData, setRelatorioData] = useState({
    faturamentoTotal: 0,
    ticketsTotal: 0,
    tempoMedioPermanencia: 0,
    faturamentoPorDia: [],
    ticketsPorDia: [],
    faturamentoPorEstacionamento: [],
  });

  // Carregar estacionamentos
  useEffect(() => {
    const fetchEstacionamentos = async () => {
      try {
        const data = await estacionamentoService.listarEstacionamentos();
        setEstacionamentos(data);

        if (data.length > 0) {
          setEstacionamentoSelecionado("todos");
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

  // Gerar dados de relatório simulados
  useEffect(() => {
    const gerarDadosRelatorio = async () => {
      if (estacionamentos.length === 0) return;

      setLoading(true);

      try {
        // Aqui seria feita uma chamada real para um endpoint de relatórios
        // Estamos gerando dados simulados para demonstração

        // Simulação de dados de tickets
        let ticketsData = [];
        let totalFaturamento = 0;

        // Para cada estacionamento, buscamos os tickets
        // Na prática, você teria um endpoint específico para relatórios
        for (const est of estacionamentos) {
          if (
            estacionamentoSelecionado === "todos" ||
            parseInt(estacionamentoSelecionado) === est.id
          ) {
            const estTickets =
              await ticketService.listarTicketsPorEstacionamento(est.id);
            ticketsData = [...ticketsData, ...estTickets];
          }
        }

        // Filtrar por data
        const dataInicioTimestamp = dataInicio.getTime();
        const dataFimTimestamp = dataFim.getTime();

        const ticketsFiltrados = ticketsData.filter((ticket) => {
          const ticketDate = new Date(ticket.hrEntrada).getTime();
          return (
            ticketDate >= dataInicioTimestamp && ticketDate <= dataFimTimestamp
          );
        });

        setTickets(ticketsFiltrados);

        // Calcular faturamento total
        totalFaturamento = ticketsFiltrados.reduce(
          (sum, ticket) => sum + ticket.valor,
          0
        );

        // Calcular tempo médio de permanência
        const tempoTotalMinutos = ticketsFiltrados
          .filter((ticket) => ticket.hrSaida)
          .reduce((sum, ticket) => {
            const entrada = new Date(ticket.hrEntrada).getTime();
            const saida = new Date(ticket.hrSaida).getTime();
            return sum + (saida - entrada) / (1000 * 60);
          }, 0);

        const ticketsComSaida = ticketsFiltrados.filter(
          (ticket) => ticket.hrSaida
        ).length;
        const tempoMedio =
          ticketsComSaida > 0 ? tempoTotalMinutos / ticketsComSaida : 0;

        // Faturamento por dia
        const diasPeriodo = {};
        const ticketsPorDia = {};

        let currentDate = new Date(dataInicio);
        const endDate = new Date(dataFim);

        while (currentDate <= endDate) {
          const dateKey = formatDate(currentDate);
          diasPeriodo[dateKey] = 0;
          ticketsPorDia[dateKey] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }

        ticketsFiltrados.forEach((ticket) => {
          const dateKey = formatDate(ticket.hrEntrada);
          if (diasPeriodo[dateKey] !== undefined) {
            diasPeriodo[dateKey] += ticket.valor;
            ticketsPorDia[dateKey] += 1;
          }
        });

        // Faturamento por estacionamento
        const faturamentoEstacionamento = {};

        estacionamentos.forEach((est) => {
          faturamentoEstacionamento[est.nome] = 0;
        });

        ticketsFiltrados.forEach((ticket) => {
          if (ticket.estacionamento && ticket.estacionamento.nome) {
            faturamentoEstacionamento[ticket.estacionamento.nome] +=
              ticket.valor;
          }
        });

        // Preparar dados para os gráficos
        const faturamentoPorDia = Object.entries(diasPeriodo).map(
          ([data, valor]) => ({
            data,
            valor,
          })
        );

        const ticketsDiarios = Object.entries(ticketsPorDia).map(
          ([data, quantidade]) => ({
            data,
            quantidade,
          })
        );

        const faturamentoPorEstacionamento = Object.entries(
          faturamentoEstacionamento
        ).map(([nome, valor]) => ({
          nome,
          valor,
        }));

        // Atualizar o estado com os dados processados
        setRelatorioData({
          faturamentoTotal: totalFaturamento,
          ticketsTotal: ticketsFiltrados.length,
          tempoMedioPermanencia: tempoMedio,
          faturamentoPorDia,
          ticketsPorDia: ticketsDiarios,
          faturamentoPorEstacionamento,
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        enqueueSnackbar("Erro ao gerar relatório", { variant: "error" });
        setLoading(false);
      }
    };

    if (estacionamentos.length > 0 && estacionamentoSelecionado) {
      gerarDadosRelatorio();
    }
  }, [
    estacionamentos,
    estacionamentoSelecionado,
    dataInicio,
    dataFim,
    enqueueSnackbar,
  ]);

  // Manipuladores de eventos
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEstacionamentoChange = (event) => {
    setEstacionamentoSelecionado(event.target.value);
  };

  const handleFiltrar = () => {
    // Recarregar dados com os filtros aplicados
    setLoading(true);
    // O useEffect já irá cuidar da atualização dos dados
    setTimeout(() => setLoading(false), 500);
  };

  const handleExportarPDF = () => {
    enqueueSnackbar("Exportação de PDF não implementada nesta versão", {
      variant: "info",
    });
  };

  const handleExportarExcel = () => {
    enqueueSnackbar("Exportação de Excel não implementada nesta versão", {
      variant: "info",
    });
  };

  // Configuração dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Dados para o gráfico de faturamento por dia
  const faturamentoChart = {
    labels: relatorioData.faturamentoPorDia.map((item) => item.data),
    datasets: [
      {
        label: "Faturamento (R$)",
        data: relatorioData.faturamentoPorDia.map((item) => item.valor),
        fill: true,
        backgroundColor: "rgba(53, 162, 235, 0.2)",
        borderColor: "rgba(53, 162, 235, 1)",
      },
    ],
  };

  // Dados para o gráfico de tickets por dia
  const ticketsChart = {
    labels: relatorioData.ticketsPorDia.map((item) => item.data),
    datasets: [
      {
        label: "Quantidade de Tickets",
        data: relatorioData.ticketsPorDia.map((item) => item.quantidade),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  // Dados para o gráfico de faturamento por estacionamento
  const estacionamentoChart = {
    labels: relatorioData.faturamentoPorEstacionamento.map((item) => item.nome),
    datasets: [
      {
        label: "Faturamento por Estacionamento",
        data: relatorioData.faturamentoPorEstacionamento.map(
          (item) => item.valor
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Renderização das abas
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Resumo
        return (
          <Grid container spacing={3}>
            {/* Cards de estatísticas */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Faturamento Total
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {formatCurrency(relatorioData.faturamentoTotal)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Total de Tickets
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {relatorioData.ticketsTotal}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tempo Médio de Permanência
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {Math.floor(relatorioData.tempoMedioPermanencia / 60)}h{" "}
                    {Math.round(relatorioData.tempoMedioPermanencia % 60)}min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráficos */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Faturamento por Dia
                </Typography>
                <Box sx={{ height: 320 }}>
                  <Line options={chartOptions} data={faturamentoChart} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Tickets por Dia
                </Typography>
                <Box sx={{ height: 320 }}>
                  <Bar options={chartOptions} data={ticketsChart} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Faturamento por Estacionamento
                </Typography>
                <Box sx={{ height: 320, display: "flex" }}>
                  <Box sx={{ flex: 1 }}>
                    <Pie
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: true,
                      }}
                      data={estacionamentoChart}
                    />
                  </Box>
                  <Box sx={{ flex: 2, pt: 5 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Estacionamento</TableCell>
                            <TableCell align="right">Faturamento</TableCell>
                            <TableCell align="right">% do Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {relatorioData.faturamentoPorEstacionamento.map(
                            (item) => (
                              <TableRow key={item.nome}>
                                <TableCell>{item.nome}</TableCell>
                                <TableCell align="right">
                                  {formatCurrency(item.valor)}
                                </TableCell>
                                <TableCell align="right">
                                  {relatorioData.faturamentoTotal > 0
                                    ? `${(
                                        (item.valor /
                                          relatorioData.faturamentoTotal) *
                                        100
                                      ).toFixed(2)}%`
                                    : "0%"}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );

      case 1: // Tickets
        return (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Estacionamento</TableCell>
                    <TableCell>Entrada</TableCell>
                    <TableCell>Saída</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.idTicket}>
                      <TableCell>{ticket.idTicket}</TableCell>
                      <TableCell>
                        {ticket.estacionamento?.nome || "-"}
                      </TableCell>
                      <TableCell>{formatDateTime(ticket.hrEntrada)}</TableCell>
                      <TableCell>
                        {ticket.hrSaida ? formatDateTime(ticket.hrSaida) : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(ticket.valor)}
                      </TableCell>
                      <TableCell>{ticket.pago ? "Pago" : "Pendente"}</TableCell>
                    </TableRow>
                  ))}
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum ticket encontrado para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <div>
        <LoadingOverlay open={loading} />

        <PageHeader
          title="Relatórios"
          subtitle="Análise de desempenho do estacionamento"
          breadcrumbs={[
            { text: "Dashboard", link: "/" },
            { text: "Relatórios" },
          ]}
        />

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Estacionamento"
                value={estacionamentoSelecionado}
                onChange={handleEstacionamentoChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="todos">Todos os Estacionamentos</MenuItem>
                {estacionamentos.map((option) => (
                  <MenuItem key={option.id} value={option.id.toString()}>
                    {option.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data Inicial"
                value={dataInicio}
                onChange={(newValue) => setDataInicio(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data Final"
                value={dataFim}
                onChange={(newValue) => setDataFim(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterAltIcon />}
                  onClick={handleFiltrar}
                  sx={{ flex: 1 }}
                >
                  Filtrar
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                >
                  Limpar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Opções de exportação */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportarPDF}
            sx={{ mr: 1 }}
          >
            Exportar PDF
          </Button>

          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={handleExportarExcel}
          >
            Exportar Excel
          </Button>
        </Box>

        {/* Abas */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="relatórios tabs"
          >
            <Tab label="Resumo" id="tab-0" />
            <Tab label="Tickets" id="tab-1" />
          </Tabs>
        </Box>

        {renderTabContent()}
      </div>
    </LocalizationProvider>
  );
};

export default Relatorios;
