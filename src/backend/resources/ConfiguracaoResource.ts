import { BaseResource } from "./BaseResource";
import { Configuracao } from "../models/types";

export class ConfiguracaoResource extends BaseResource<Configuracao> {
  toArray() {
    return {
      id: this.resource.id,
      hora_abertura: this.resource.hora_abertura,
      hora_fechamento: this.resource.hora_fechamento,
      almoco_inicio: this.resource.almoco_inicio,
      almoco_fim: this.resource.almoco_fim,
      dias_funcionamento: this.resource.dias_funcionamento,
    };
  }
}
