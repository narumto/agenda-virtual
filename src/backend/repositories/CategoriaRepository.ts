import { BaseRepository } from "./BaseRepository";
import { Categoria } from "../models/types";

export class CategoriaRepository extends BaseRepository<Categoria, string> {
  constructor() {
    super("categorias", "id");
  }
}
