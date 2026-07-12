import { BaseRepository } from "./BaseRepository";
import { Servico } from "../models/types";
import { supabase } from "../database/client";

export class ServicoRepository extends BaseRepository<Servico, string> {
  constructor() {
    super("servicos", "id");
  }

  async listByCategory(categoriaId: string): Promise<Servico[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("categoria_id", categoriaId);

    if (error) throw error;
    return data as Servico[];
  }

  async listActive(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("ativo", true);

    if (error) throw error;
    return data as Servico[];
  }
}
