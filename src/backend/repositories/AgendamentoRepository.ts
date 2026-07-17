import { BaseRepository } from "./BaseRepository";
import { Agendamento } from "../models/types";
import { supabase } from "../database/client";

export class AgendamentoRepository extends BaseRepository<Agendamento, string> {
  constructor() {
    super("agendamentos", "id");
  }

  override async all(): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        pacientes (
          id,
          nome,
          telefone,
          email
        ),
        servicos (
          id,
          nome,
          preco,
          duracao_minutos
        )
      `)
      .order("inicio", { ascending: true });

    if (error) throw error;
    return data as any[];
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

  override async create(item: Partial<Agendamento>): Promise<any> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(item as any)
      .select()
      .single();

    if (error) throw error;

    const { data, error: findError } = await supabase
      .from(this.tableName)
      .select(`
        *,
        pacientes (
          id,
          nome,
          telefone,
          email
        ),
        servicos (
          id,
          nome,
          preco,
          duracao_minutos
        )
      `)
      .eq(this.primaryKeyName, created.id)
      .single();

    if (findError) throw findError;
    return data;
  }

  override async update(id: string, item: Partial<Agendamento>): Promise<any> {
    const { error } = await supabase
      .from(this.tableName)
      .update(item as any)
      .eq(this.primaryKeyName, id);

    if (error) throw error;

    const { data, error: findError } = await supabase
      .from(this.tableName)
      .select(`
        *,
        pacientes (
          id,
          nome,
          telefone,
          email
        ),
        servicos (
          id,
          nome,
          preco,
          duracao_minutos
        )
      `)
      .eq(this.primaryKeyName, id)
      .single();

    if (findError) throw findError;
    return data;
  }
}
