export interface Professional {
  professionals_id: number;
  professionals_name: string;
  instance_number?: string;
  instance_name?: string;
}

export interface Appointment {
  appointment_id: number;
  paciente_nome: string;
  paciente_telefone: string;
  data_do_atendimento: string; // DD/MM/YYYY
  horario_inicial_do_atendimento: string;
  horario_final_do_atendimento?: string;
  professional_id: number;
  notificado: boolean;
  erro: boolean;
  error_message?: string;
  professional_name?: string; // Joined
}

export type FilterStatus = 'Todos' | 'Não Notificado' | 'Notificado' | 'Erro';
export type FilterTurno = 'Todos' | 'Manhã' | 'Tarde';
