import { BaseResource } from "./BaseResource";
import { Categoria } from "../models/types";

export class CategoriaResource extends BaseResource<Categoria> {
  toArray() {
    return {
      id: this.resource.id,
      nome: this.resource.nome,
    };
  }
}
