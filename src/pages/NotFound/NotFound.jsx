import React from "react";
import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Paper
        sx={{
          p: 5,
          mt: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: "error.main", mb: 3 }} />

        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          Página não encontrada
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 500, mb: 4 }}
        >
          A página que você está procurando não existe ou foi movida. Verifique
          se o endereço está correto ou retorne à página inicial.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
        >
          Voltar para o Dashboard
        </Button>

        <Box sx={{ mt: 4 }}>
          <Button variant="text" color="inherit" onClick={() => navigate(-1)}>
            Voltar para a página anterior
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
