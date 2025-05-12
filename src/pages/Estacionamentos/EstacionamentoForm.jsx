import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControlLabel,
  Switch,
  InputAdornment,
  Divider,
} from "@mui/material";
import { useSnackbar } from "notistack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, Controller } from "react-hook-form";

import PageHeader from "../../components/common/PageHeader";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import estacionamentoService from "../../services/estacionamentoService";
import { validateEstacionamento } from "../../utils/validators";

const EstacionamentoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      endereco: "",
      qtd_vagas: "",
      taxa_horaria: "",
      status: true,
    },
  });

  // Carregar dados para edição
  useEffect(() => {
    const fetchEstacionamento = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await estacionamentoService.obterEstacionamentoPorId(id);
          reset({
            nome: data.nome,
            endereco: data.endereco,
            qtd_vagas: data.qtd_vagas,
            taxa_horaria: data.taxa_horaria,
            status: data.status,
          });
          setLoading(false);
        } catch (error) {
          console.error("Erro ao buscar estacionamento:", error);
          enqueueSnackbar("Erro ao carregar dados do estacionamento", {
            variant: "error",
          });
          setLoading(false);
          navigate("/estacionamentos");
        }
      }
    };

    fetchEstacionamento();
  }, [id, reset, navigate, enqueueSnackbar]);

  // Salvar formulário
  const onSubmit = async (data) => {
    // Validar dados
    const errors = validateEstacionamento(data);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        enqueueSnackbar(message, { variant: "error" });
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await estacionamentoService.atualizarEstacionamento(id, data);
        enqueueSnackbar("Estacionamento atualizado com sucesso", {
          variant: "success",
        });
      } else {
        await estacionamentoService.criarEstacionamento(data);
        enqueueSnackbar("Estacionamento criado com sucesso", {
          variant: "success",
        });
      }

      setLoading(false);
      navigate("/estacionamentos");
    } catch (error) {
      console.error("Erro ao salvar estacionamento:", error);
      enqueueSnackbar("Erro ao salvar estacionamento", { variant: "error" });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/estacionamentos");
  };

  return (
    <div>
      <LoadingOverlay open={loading} />

      <PageHeader
        title={isEditing ? "Editar Estacionamento" : "Novo Estacionamento"}
        subtitle={
          isEditing
            ? "Atualize os dados do estacionamento"
            : "Cadastre um novo estacionamento"
        }
        breadcrumbs={[
          { text: "Dashboard", link: "/" },
          { text: "Estacionamentos", link: "/estacionamentos" },
          { text: isEditing ? "Editar" : "Novo" },
        ]}
      />

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Estacionamento"
                    fullWidth
                    required
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="endereco"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Endereço"
                    fullWidth
                    required
                    error={!!errors.endereco}
                    helperText={errors.endereco?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="qtd_vagas"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantidade de Vagas"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                    error={!!errors.qtd_vagas}
                    helperText={errors.qtd_vagas?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="taxa_horaria"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Taxa Horária"
                    type="number"
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                      inputProps: { step: "0.01", min: 0 },
                    }}
                    error={!!errors.taxa_horaria}
                    helperText={errors.taxa_horaria?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      value ? "Estacionamento Ativo" : "Estacionamento Inativo"
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<ArrowBackIcon />}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  {isEditing ? "Atualizar" : "Salvar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default EstacionamentoForm;
