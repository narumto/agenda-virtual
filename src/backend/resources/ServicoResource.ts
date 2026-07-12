import { BaseResource } from "./BaseResource";
import { Servico } from "../models/types";

export class ServicoResource extends BaseResource<Servico> {
  toArray() {
    return {
      id: this.resource.id,
      categoria_id: this.resource.categoria_id,
      nome: this.resource.nome,
      descricao: this.resource.descricao || null,
      foto_url: this.resource.foto_url || null,
      duracao_minutos: this.resource.duracao_minutos,
      preco: Number(this.resource.preco),
      ativo: this.resource.ativo,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
    };
  }
}
