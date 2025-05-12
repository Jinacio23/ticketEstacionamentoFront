// Verifica se o valor é vazio
export const isEmptyValue = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

// Validações de formulário para estacionamento
export const validateEstacionamento = (values) => {
  const errors = {};

  if (isEmptyValue(values.nome)) {
    errors.nome = "Nome é obrigatório";
  }

  if (isEmptyValue(values.endereco)) {
    errors.endereco = "Endereço é obrigatório";
  }

  if (isEmptyValue(values.qtd_vagas)) {
    errors.qtd_vagas = "Quantidade de vagas é obrigatória";
  } else if (values.qtd_vagas <= 0) {
    errors.qtd_vagas = "A quantidade de vagas deve ser maior que zero";
  }

  if (isEmptyValue(values.taxa_horaria)) {
    errors.taxa_horaria = "Taxa horária é obrigatória";
  } else if (values.taxa_horaria < 0) {
    errors.taxa_horaria = "A taxa horária não pode ser negativa";
  }

  return errors;
};

// Validações para formas de pagamento
export const validateFormaPagamento = (value) => {
  const formasValidas = ["pix", "dinheiro", "cartao"];

  if (isEmptyValue(value)) {
    return "Forma de pagamento é obrigatória";
  }

  if (!formasValidas.includes(value.toLowerCase())) {
    return "Forma de pagamento inválida. Use: PIX, Dinheiro ou Cartão";
  }

  return null;
};

// Validações para ticket
export const validateTicket = (values) => {
  const errors = {};

  if (isEmptyValue(values.estacionamentoId)) {
    errors.estacionamentoId = "Estacionamento é obrigatório";
  }

  return errors;
};

// Validações para QR Code
export const validateQrCode = (value) => {
  if (isEmptyValue(value)) {
    return "QR Code inválido ou vazio";
  }

  // Verifica se o QR Code está no formato esperado (token)
  if (
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      value
    )
  ) {
    return "Formato de QR Code inválido";
  }

  return null;
};
