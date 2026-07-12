import { BaseRepository } from "./BaseRepository";
import { Agendamento } from "../models/types";
import { supabase } from "../database/client";

export class AgendamentoRepository extends BaseRepository<Agendamento, string> {
  constructor() {
    super("agendamentos", "id");
  }

  async findOverlapping(
    profissionalId: string,
    inicio: string,
    fim: string,
    excludeId?: string
  ): Promise<Agendamento[]> {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .eq("profissional_id", profissionalId)
      .neq("status", "CANCELADO")
      .lt("inicio", fim)
      .gt("fim", inicio);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Agendamento[];
  }

  async listByProfessional(profissionalId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("profissional_id", profissionalId)
      .order("inicio", { ascending: true });

    if (error) throw error;
    return data as Agendamento[];
  }

  async listByPatient(pacienteId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("inicio", { ascending: true });

    if (error) throw error;
    return data as Agendamento[];
  }
}
