import { BaseRepository } from "./BaseRepository";
import { BloqueioAgenda } from "../models/types";
import { supabase } from "../database/client";

export class BloqueioAgendaRepository extends BaseRepository<BloqueioAgenda, string> {
  constructor() {
    super("bloqueios_agenda", "id");
  }

  async findOverlapping(
    profissionalId: string,
    inicio: string,
    fim: string,
    excludeId?: string
  ): Promise<BloqueioAgenda[]> {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .eq("profissional_id", profissionalId)
      .lt("inicio", fim)
      .gt("fim", inicio);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BloqueioAgenda[];
  }

  async listByProfessional(profissionalId: string): Promise<BloqueioAgenda[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("profissional_id", profissionalId)
      .order("inicio", { ascending: true });

    if (error) throw error;
    return data as BloqueioAgenda[];
  }
}
