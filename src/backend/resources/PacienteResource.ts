import { BaseResource } from "./BaseResource";
import { Paciente } from "../models/types";

export class PacienteResource extends BaseResource<Paciente> {
  toArray() {
    return {
      id: this.resource.id,
      nome: this.resource.nome,
      telefone: this.resource.telefone,
      email: this.resource.email || null,
      google_id: this.resource.google_id || null,
      data_nascimento: this.resource.data_nascimento || null,
      nif: this.resource.nif || null,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
    };
  }
}
