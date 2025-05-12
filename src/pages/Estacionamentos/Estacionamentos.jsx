import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import estacionamentoService from "../../services/estacionamentoService";
import { formatCurrency } from "../../utils/formatters";

const Estacionamentos = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    id: null,
    status: null,
  });

  // Carregar dados dos estacionamentos
  const fetchEstacionamentos = async () => {
    try {
      setLoading(true);
      const data = await estacionamentoService.listarEstacionamentos();
      setEstacionamentos(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar estacionamentos:", error);
      enqueueSnackbar("Erro ao carregar estacionamentos", { variant: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstacionamentos();
  }, []);

  // Manipuladores de eventos
  const handleCreate = () => {
    navigate("/estacionamentos/novo");
  };

  const handleEdit = (id) => {
    navigate(`/estacionamentos/editar/${id}`);
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await estacionamentoService.alternarStatusEstacionamento(toggleDialog.id);
      setToggleDialog({ open: false, id: null, status: null });
      enqueueSnackbar("Status do estacionamento alterado com sucesso", {
        variant: "success",
      });
      fetchEstacionamentos();
    } catch (error) {
      console.error("Erro ao alternar status:", error);
      enqueueSnackbar("Erro ao alternar status do estacionamento", {
        variant: "error",
      });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await estacionamentoService.excluirEstacionamento(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      enqueueSnackbar("Estacionamento excluído com sucesso", {
        variant: "success",
      });
      fetchEstacionamentos();
    } catch (error) {
      console.error("Erro ao excluir estacionamento:", error);
      enqueueSnackbar("Erro ao excluir estacionamento", { variant: "error" });
      setLoading(false);
    }
  };

  // Configuração do DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    { field: "endereco", headerName: "Endereço", flex: 1, minWidth: 250 },
    {
      field: "qtd_vagas",
      headerName: "Vagas",
      type: "number",
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "taxa_horaria",
      headerName: "Taxa Horária",
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value),
      align: "right",
      headerAlign: "right",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => handleEdit(params.row.id)}
              color="primary"
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={params.row.status ? "Desativar" : "Ativar"}>
            <IconButton
              onClick={() =>
                setToggleDialog({
                  open: true,
                  id: params.row.id,
                  status: params.row.status,
                })
              }
              color={params.row.status ? "success" : "default"}
              size="small"
            >
              {params.row.status ? (
                <ToggleOnIcon fontSize="small" />
              ) : (
                <ToggleOffIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton
              onClick={() => setDeleteDialog({ open: true, id: params.row.id })}
              color="error"
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Estacionamentos"
        subtitle="Gerenciamento de estacionamentos"
        buttonText="Novo Estacionamento"
        buttonIcon={AddIcon}
        buttonAction={handleCreate}
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Estacionamentos" },
        ]}
      />

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ height: "calc(100vh - 250px)", width: "100%" }}>
          <DataGrid
            rows={estacionamentos}
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

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmationDialog
        open={deleteDialog.open}
        title="Excluir Estacionamento"
        message="Tem certeza que deseja excluir este estacionamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />

      {/* Diálogo de confirmação para alternar status */}
      <ConfirmationDialog
        open={toggleDialog.open}
        title={
          toggleDialog.status
            ? "Desativar Estacionamento"
            : "Ativar Estacionamento"
        }
        message={
          toggleDialog.status
            ? "Deseja desativar este estacionamento? Tickets não poderão ser emitidos para ele."
            : "Deseja ativar este estacionamento? Ele ficará disponível para emissão de tickets."
        }
        confirmText={toggleDialog.status ? "Desativar" : "Ativar"}
        cancelText="Cancelar"
        confirmButtonColor={toggleDialog.status ? "error" : "success"}
        onConfirm={handleToggleStatus}
        onCancel={() =>
          setToggleDialog({ open: false, id: null, status: null })
        }
      />
    </div>
  );
};

export default Estacionamentos;
