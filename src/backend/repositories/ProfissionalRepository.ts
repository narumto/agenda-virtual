import { BaseRepository } from "./BaseRepository";
import { Profissional } from "../models/types";
import { supabase } from "../database/client";

export class ProfissionalRepository extends BaseRepository<Profissional, string> {
  constructor() {
    super("profissionais", "id");
  }

  async listActive(): Promise<Profissional[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("ativo", true)
      .order("prioridade", { ascending: false });

    if (error) throw error;
    return data as Profissional[];
  }

  async listServices(profissionalId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("profissional_servico")
      .select("servico_id")
      .eq("profissional_id", profissionalId);
    if (error) throw error;
    return data.map((d: any) => d.servico_id);
  }

  async linkServices(profissionalId: string, servicoIds: string[]): Promise<void> {
    const { error: delError } = await supabase
      .from("profissional_servico")
      .delete()
      .eq("profissional_id", profissionalId);
    if (delError) throw delError;

    if (servicoIds.length === 0) return;

    const { error: insError } = await supabase
      .from("profissional_servico")
      .insert(
        servicoIds.map((servicoId) => ({
          profissional_id: profissionalId,
          servico_id: servicoId,
        }))
      );
    if (insError) throw insError;
  }
}
