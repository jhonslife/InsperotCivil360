export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} é obrigatório`;
  }
  return null;
}

export function validateNumber(value: string, fieldName: string): string | null {
  if (value && isNaN(Number(value))) {
    return `${fieldName} deve ser um número válido`;
  }
  return null;
}
