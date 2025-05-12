import React from "react";
import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const getStatusProps = (status, type = "default") => {
  const statusMap = {
    default: {
      true: { label: "Ativo", color: "success", icon: <CheckCircleIcon /> },
      false: { label: "Inativo", color: "error", icon: <CancelIcon /> },
    },
    pago: {
      true: { label: "Pago", color: "success", icon: <CheckCircleIcon /> },
      false: { label: "Pendente", color: "warning", icon: <AccessTimeIcon /> },
    },
  };

  return (
    statusMap[type][status] ||
    statusMap.default[status] || {
      label: "Desconhecido",
      color: "default",
      icon: null,
    }
  );
};

const StatusBadge = ({ status, type = "default", size = "medium" }) => {
  const { label, color, icon } = getStatusProps(status, type);

  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default StatusBadge;
