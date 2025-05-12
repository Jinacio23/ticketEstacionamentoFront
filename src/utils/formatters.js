import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Formata valor em reais
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Formata data e hora
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString;
  }
};

// Formata apenas a data
export const formatDate = (dateString) => {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString;
  }
};

// Formata apenas a hora
export const formatTime = (dateString) => {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "HH:mm:ss", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar hora:", error);
    return dateString;
  }
};

// Formata distância até agora (ex: "há 5 minutos")
export const formatTimeAgo = (dateString) => {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar tempo relativo:", error);
    return dateString;
  }
};

// Calcula o tempo de permanência entre duas datas
export const calculateDuration = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) return "-";

  try {
    const startDate =
      typeof startDateString === "string"
        ? parseISO(startDateString)
        : startDateString;
    const endDate =
      typeof endDateString === "string"
        ? parseISO(endDateString)
        : endDateString;

    const diffInMilliseconds = endDate - startDate;
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}min`;
  } catch (error) {
    console.error("Erro ao calcular duração:", error);
    return "-";
  }
};
