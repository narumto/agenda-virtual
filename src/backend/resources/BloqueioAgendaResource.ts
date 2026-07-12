import { BaseResource } from "./BaseResource";
import { BloqueioAgenda } from "../models/types";

export class BloqueioAgendaResource extends BaseResource<BloqueioAgenda> {
  toArray() {
    return {
      id: this.resource.id,
      profissional_id: this.resource.profissional_id,
      inicio: this.resource.inicio,
      fim: this.resource.fim,
      motivo: this.resource.motivo,
    };
  }
}
