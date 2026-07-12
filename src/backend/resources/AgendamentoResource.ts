import { BaseResource } from "./BaseResource";
import { Agendamento } from "../models/types";

export class AgendamentoResource extends BaseResource<Agendamento> {
  toArray() {
    return {
      id: this.resource.id,
      paciente_id: this.resource.paciente_id,
      profissional_id: this.resource.profissional_id,
      servico_id: this.resource.servico_id,
      inicio: this.resource.inicio,
      fim: this.resource.fim,
      status: this.resource.status,
      observacao: this.resource.observacao || null,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
    };
  }
}
