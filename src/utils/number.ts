export function parseDecimalInput(value: string): number {
  return Number(value.replace(',', '.').trim());
}

export function parseOptionalDecimalInput(value: string): number | null {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = parseDecimalInput(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}
