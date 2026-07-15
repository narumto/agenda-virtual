import { BaseResource } from "./BaseResource";
import { Agendamento } from "../models/types";

export class AgendamentoResource extends BaseResource<Agendamento> {
  toArray() {
    const r = this.resource as any;
    return {
      id: r.id,
      paciente_id: r.paciente_id,
      servico_id: r.servico_id,
      inicio: r.inicio,
      fim: r.fim,
      status: r.status,
      observacao: r.observacao || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      // Enriched from join (present when fetched via listByPatient)
      servico: r.servicos
        ? {
            id: r.servicos.id,
            nome: r.servicos.nome,
            preco: r.servicos.preco,
            duracao_minutos: r.servicos.duracao_minutos,
          }
        : null,
    };
  }
}
