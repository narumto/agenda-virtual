import { BaseRepository } from "./BaseRepository";
import { Configuracao } from "../models/types";

export class ConfiguracaoRepository extends BaseRepository<Configuracao, boolean> {
  constructor() {
    super("configuracoes", "id");
  }
}
