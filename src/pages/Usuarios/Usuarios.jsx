import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import usuarioService from "../../services/usuarioService";
import { useAuth } from "../../contexts/AuthContext";

const Usuarios = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Carregar dados dos usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.listarUsuarios();
      setUsuarios(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      enqueueSnackbar("Erro ao carregar usuários", { variant: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    console.log(usuarios);
  }, [usuarios]);

  // Manipuladores de eventos
  const handleCreate = () => {
    navigate("/usuarios/novo");
  };

  const handleEdit = (id) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await usuarioService.excluirUsuario(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      enqueueSnackbar("Usuário excluído com sucesso", {
        variant: "success",
      });
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      enqueueSnackbar("Erro ao excluir usuário", { variant: "error" });
      setLoading(false);
    }
  };

  // Configuração do DataGrid
  const columns = [
    { field: "id", 
      headerName: "ID", 
      width: 70,
      valueGetter: (params) => params.row.usuarioId,
    },
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    { 
      field: "estacionamento", 
      headerName: "Estacionamento", 
      flex: 1, 
      minWidth: 200,
      valueGetter: (params) => params.row.estacionamento?.nome || "-"
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => handleEdit(params.row.usuarioId)}
              color="primary"
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isAdmin && (
            <Tooltip title="Excluir">
              <IconButton
                onClick={() => setDeleteDialog({ open: true, id: params.row.usuarioId })}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Usuários"
        subtitle="Gerenciamento de usuários"
        buttonText="Novo Usuário"
        buttonIcon={AddIcon}
        buttonAction={handleCreate}
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Usuários" },
        ]}
      />

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ height: "calc(100vh - 250px)", width: "100%" }}>
          <DataGrid
            rows={usuarios}
            columns={columns}
            getRowId={(row) => row.usuarioId}
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
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </div>
  );
};

export default Usuarios;
