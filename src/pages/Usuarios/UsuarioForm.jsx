import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Paper,
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import usuarioService from "../../services/usuarioService";
import estacionamentoService from "../../services/estacionamentoService";
import LoadingOverlay from "../../components/common/LoadingOverlay";

const UsuarioForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [estacionamentos, setEstacionamentos] = useState([]);
    const [form, setForm] = useState({
        nome: "",
        senha: "",
        estacionamentoId: "",
    });

    // Buscar estacionamentos
    useEffect(() => {
        const fetchEstacionamentos = async () => {
            try {
                const data = await estacionamentoService.listarEstacionamentos();
                setEstacionamentos(data);
            } catch (error) {
                enqueueSnackbar("Erro ao carregar estacionamentos", { variant: "error" });
            }
        };
        fetchEstacionamentos();
    }, [enqueueSnackbar]);

    // Se edição, buscar dados do usuário
    useEffect(() => {
        if (id) {
            setLoading(true);
            usuarioService.obterUsuarioPorId(id)
                .then((data) => {
                    setForm({
                        nome: data.nome || "",
                        senha: "",
                        estacionamentoId: data.estacionamento?.id?.toString() || "",
                    });
                })
                .catch(() => {
                    enqueueSnackbar("Erro ao carregar usuário", { variant: "error" });
                })
                .finally(() => setLoading(false));
        }
    }, [id, enqueueSnackbar]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!form.nome || !form.estacionamentoId || (!id && !form.senha)) {
                enqueueSnackbar("Preencha todos os campos obrigatórios", { variant: "warning" });
                setLoading(false);
                return;
            }
            const payload = {
                nome: form.nome,
            };
            if (!id) {
                payload.senha = form.senha;
                payload.estacionamentoId = form.estacionamentoId;
            } else {
                payload.senha = form.senha;
            }
            if (id) {
                await usuarioService.atualizarUsuario(id, payload);
                enqueueSnackbar("Usuário atualizado com sucesso!", { variant: "success" });
            } else {
                await usuarioService.criarUsuario(payload);
                enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
            }
            navigate("/usuarios");
        } catch (error) {
            enqueueSnackbar("Erro ao salvar usuário", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3 }}>
            <LoadingOverlay open={loading} />
            <Typography variant="h5" mb={2}>
                {id ? "Editar Usuário" : "Novo Usuário"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                <TextField
                    label="Nome"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Senha"
                    name="senha"
                    type="password"
                    value={form.senha}
                    onChange={handleChange}
                    required={!id}
                    fullWidth
                />
                {!id && (
                <TextField
                    select
                    label="Estacionamento"
                    name="estacionamentoId"
                    value={form.estacionamentoId}
                    onChange={handleChange}
                    required
                    fullWidth
                >
                    <MenuItem value="">Selecione...</MenuItem>
                    {estacionamentos.map((est) => (
                        <MenuItem key={est.id} value={est.id.toString()}>
                            {est.nome}
                        </MenuItem>
                    ))}
                </TextField>
                )}
                <Box display="flex" gap={2} mt={2}>
                    <Button type="submit" variant="contained" color="primary">
                        Salvar
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/usuarios")}>Cancelar</Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default UsuarioForm; 