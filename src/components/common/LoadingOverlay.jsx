import React from "react";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";

const LoadingOverlay = ({ open, message = "Carregando..." }) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} thickness={5} />
      <Box mt={2}>
        <Typography variant="h6">{message}</Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
