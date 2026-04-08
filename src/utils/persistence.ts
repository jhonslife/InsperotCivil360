export interface PersistenceTask {
  label: string;
  run: () => Promise<void>;
}

export async function runPersistenceTasks(tasks: PersistenceTask[]): Promise<string[]> {
  const warnings: string[] = [];

  for (const task of tasks) {
    try {
      await task.run();
    } catch (error) {
      console.error(`Erro na tarefa de persistência: ${task.label}`, error);
      warnings.push(task.label);
    }
  }

  return warnings;
}

export function buildPersistenceAlertMessage(successMessage: string, warnings: string[]): string {
  if (warnings.length === 0) {
    return successMessage;
  }

  return `${successMessage}\n\nPendências após o salvamento: ${warnings.join(', ')}.`;
}
