import { BaseResource } from "./BaseResource";
import { Profissional } from "../models/types";

export class ProfissionalResource extends BaseResource<Profissional> {
  toArray() {
    return {
      id: this.resource.id,
      nome: this.resource.nome,
      telefone: this.resource.telefone || null,
      foto_url: this.resource.foto_url || null,
      prioridade: this.resource.prioridade,
      ativo: this.resource.ativo,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
    };
  }
}
