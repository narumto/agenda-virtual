import { ConfiguracaoRepository } from "../repositories/ConfiguracaoRepository";
import { Configuracao } from "../models/types";

export class ConfiguracaoService {
  private repository = new ConfiguracaoRepository();

  async getConfig(): Promise<Configuracao> {
    const config = await this.repository.find(true);
    if (!config) {
      const defaultConfig: Partial<Configuracao> = {
        id: true,
        hora_abertura: "08:00:00",
        hora_fechamento: "18:00:00",
        almoco_inicio: "12:00:00",
        almoco_fim: "13:00:00",
        dias_funcionamento: [1, 2, 3, 4, 5],
      };
      return await this.repository.create(defaultConfig);
    }
    return config;
  }

  async updateConfig(data: Partial<Configuracao>): Promise<Configuracao> {
    if (data.hora_abertura && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.hora_abertura)) {
      throw new Error("Formato inválido para hora_abertura. Use HH:MM ou HH:MM:SS");
    }
    if (data.hora_fechamento && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.hora_fechamento)) {
      throw new Error("Formato inválido para hora_fechamento. Use HH:MM ou HH:MM:SS");
    }
    if (data.almoco_inicio && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.almoco_inicio)) {
      throw new Error("Formato inválido para almoco_inicio. Use HH:MM ou HH:MM:SS");
    }
    if (data.almoco_fim && !/^\d{2}:\d{2}(:\d{2})?$/.test(data.almoco_fim)) {
      throw new Error("Formato inválido para almoco_fim. Use HH:MM ou HH:MM:SS");
    }
    if (data.dias_funcionamento && (!Array.isArray(data.dias_funcionamento) || data.dias_funcionamento.some(d => d < 0 || d > 6))) {
      throw new Error("dias_funcionamento deve ser um array de inteiros de 0 (Domingo) a 6 (Sábado)");
    }

    await this.getConfig();
    const updateData: Partial<Configuracao> = {};
    if (data.hora_abertura !== undefined) updateData.hora_abertura = data.hora_abertura;
    if (data.hora_fechamento !== undefined) updateData.hora_fechamento = data.hora_fechamento;
    if (data.almoco_inicio !== undefined) updateData.almoco_inicio = data.almoco_inicio;
    if (data.almoco_fim !== undefined) updateData.almoco_fim = data.almoco_fim;
    if (data.dias_funcionamento !== undefined) updateData.dias_funcionamento = data.dias_funcionamento;

    return await this.repository.update(true, updateData);
  }
}
