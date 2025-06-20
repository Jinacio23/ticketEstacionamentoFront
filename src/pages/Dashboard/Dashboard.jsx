import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import StatusBadge from "../../components/common/StatusBadge";

import estacionamentoService from "../../services/estacionamentoService";
import ticketService from "../../services/ticketService";
import { formatCurrency } from "../../utils/formatters";
import { useAuth } from "../../contexts/AuthContext";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCard = ({ title, value, icon, color, loading }) => {
  const IconComponent = icon;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              p: 1.5,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComponent sx={{ fontSize: 30, color: `${color}.main` }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [estacionamentoSelecionado, setEstacionamentoSelecionado] = useState("todos");
  const [estatisticas, setEstatisticas] = useState({
    totalEstacionamentos: 0,
    estacionamentosAtivos: 0,
    totalVagas: 0,
    vagasDisponiveis: 0,
    ticketsAtivos: 0,
    faturamentoHoje: 0,
  });

  const { isAdmin } = useAuth();

  const handleEstacionamentoChange = (event) => {
    setEstacionamentoSelecionado(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar estacionamentos
        const estacionamentosData = await estacionamentoService.listarEstacionamentos();
        setEstacionamentos(estacionamentosData);

        // Filtrar estacionamentos baseado na seleção
        const estacionamentosFiltrados = estacionamentoSelecionado === "todos" 
          ? estacionamentosData
          : estacionamentosData.filter(e => e.id.toString() === estacionamentoSelecionado);

        // Calcular estatísticas
        const estacionamentosAtivos = estacionamentosFiltrados.filter(
          (e) => e.status
        ).length;
        const totalVagas = estacionamentosFiltrados.reduce(
          (acc, e) => acc + e.qtd_vagas,
          0
        );

        // Buscar tickets ativos para cada estacionamento
        let ticketsAtivos = 0;
        let vagasOcupadas = 0;

        for (const est of estacionamentosFiltrados.filter((e) => e.status)) {
          const tickets = await ticketService.listarTicketsAtivos(est.id);
          ticketsAtivos += tickets.length;
          vagasOcupadas += tickets.length;
        }

        setEstatisticas({
          totalEstacionamentos: estacionamentosFiltrados.length,
          estacionamentosAtivos,
          totalVagas,
          vagasDisponiveis: totalVagas - vagasOcupadas,
          ticketsAtivos,
          faturamentoHoje: 2500.0, // Valor simulado para demonstração
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [estacionamentoSelecionado]); // Adicionar estacionamentoSelecionado como dependência

  // Dados para o gráfico de ocupação
  const ocupacaoData = {
    labels: estacionamentos
      .filter((e) => e.status && (estacionamentoSelecionado === "todos" || e.id.toString() === estacionamentoSelecionado))
      .map((e) => e.nome),
    datasets: [
      {
        label: "Vagas Totais",
        data: estacionamentos
          .filter((e) => e.status && (estacionamentoSelecionado === "todos" || e.id.toString() === estacionamentoSelecionado))
          .map((e) => e.qtd_vagas),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const ocupacaoOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Capacidade por Estacionamento",
      },
    },
  };

  return (
    <div>
      <LoadingOverlay open={loading} message="Carregando dashboard..." />

      <PageHeader title="Dashboard" subtitle="Visão geral do sistema" />

      {/* Filtro de Estacionamento - Apenas para Admin */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
          </Grid>
        </Paper>
      )}

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Estacionamentos Ativos"
            value={`${estatisticas.estacionamentosAtivos}/${estatisticas.totalEstacionamentos}`}
            icon={LocalParkingIcon}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Vagas Disponíveis"
            value={`${estatisticas.vagasDisponiveis}/${estatisticas.totalVagas}`}
            icon={DirectionsCarIcon}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Tickets Ativos"
            value={estatisticas.ticketsAtivos}
            icon={ConfirmationNumberIcon}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Faturamento Hoje"
            value={formatCurrency(estatisticas.faturamentoHoje)}
            icon={AttachMoneyIcon}
            color="error"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Gráficos e tabelas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: "100%",
              borderRadius: 2,
              transition: "box-shadow 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 3
              }
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <DirectionsCarIcon sx={{ color: "primary.main" }} />
              Ocupação por Estacionamento
            </Typography>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                  bgcolor: "background.paper",
                  borderRadius: 1
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                  bgcolor: "background.paper",
                  borderRadius: 1
                }}
              >
                <Bar options={ocupacaoOptions} data={ocupacaoData} />
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: "100%",
              borderRadius: 2,
              transition: "box-shadow 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 3
              }
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <LocalParkingIcon sx={{ color: "primary.main" }} />
              Status dos Estacionamentos
            </Typography>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                  bgcolor: "background.paper",
                  borderRadius: 1
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  mt: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  overflow: "hidden"
                }}
              >
                {estacionamentos.map((estacionamento) => (
                  <Box
                    key={estacionamento.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 2,
                      px: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:last-child": {
                        borderBottom: "none"
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                        transform: "translateX(6px)"
                      }
                    }}
                  >
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontWeight: 500,
                        color: "text.primary"
                      }}
                    >
                      {estacionamento.nome}
                    </Typography>
                    <StatusBadge status={estacionamento.status} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
