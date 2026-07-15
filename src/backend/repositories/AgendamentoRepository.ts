import { BaseRepository } from "./BaseRepository";
import { Agendamento } from "../models/types";
import { supabase } from "../database/client";

export class AgendamentoRepository extends BaseRepository<Agendamento, string> {
  constructor() {
    super("agendamentos", "id");
  }

  async listByPatient(pacienteId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*, servicos(id, nome, preco, duracao_minutos)")
      .eq("paciente_id", pacienteId)
      .order("inicio", { ascending: false });

    if (error) throw error;
    return data as any[];
  }
}
