import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowISO(): string {
  return new Date().toISOString();
}
