import { BaseRepository } from "./BaseRepository";
import { FichaTratamento, SessaoTratamento, RegiaoAdicional } from "../models/types";
import { supabase } from "../database/client";

export class FichaTratamentoRepository extends BaseRepository<FichaTratamento, string> {
  constructor() {
    super("fichas_tratamento", "id");
  }

  async findByPacienteId(pacienteId: string): Promise<FichaTratamento[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        paciente:pacientes (*),
        sessoes:sessoes_tratamento (*),
        regioes_adicionais:regioes_adicionais (*)
      `)
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as FichaTratamento[];
  }

  async findWithDetails(id: string): Promise<FichaTratamento | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        paciente:pacientes (*),
        sessoes:sessoes_tratamento (*),
        regioes_adicionais:regioes_adicionais (*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as FichaTratamento | null;
  }

  async addSessao(sessao: Partial<SessaoTratamento>): Promise<SessaoTratamento> {
    const { data, error } = await supabase
      .from("sessoes_tratamento")
      .insert(sessao as any)
      .select()
      .single();

    if (error) throw error;
    return data as SessaoTratamento;
  }

  async deleteSessao(sessaoId: string): Promise<boolean> {
    const { error } = await supabase
      .from("sessoes_tratamento")
      .delete()
      .eq("id", sessaoId);

    if (error) throw error;
    return true;
  }

  async addRegiaoAdicional(regiao: Partial<RegiaoAdicional>): Promise<RegiaoAdicional> {
    const { data, error } = await supabase
      .from("regioes_adicionais")
      .insert(regiao as any)
      .select()
      .single();

    if (error) throw error;
    return data as RegiaoAdicional;
  }

  async deleteRegiaoAdicional(regiaoId: string): Promise<boolean> {
    const { error } = await supabase
      .from("regioes_adicionais")
      .delete()
      .eq("id", regiaoId);

    if (error) throw error;
    return true;
  }
}
