import { AgendamentoRepository } from "../repositories/AgendamentoRepository";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import { ServicoRepository } from "../repositories/ServicoRepository";
import { BloqueioAgendaRepository } from "../repositories/BloqueioAgendaRepository";
import { ConfiguracaoService } from "./ConfiguracaoService";
import { Agendamento } from "../models/types";

export class AgendamentoService {
  private repository = new AgendamentoRepository();
  private pacienteRepo = new PacienteRepository();
  private profissionalRepo = new ProfissionalRepository();
  private servicoRepo = new ServicoRepository();
  private bloqueioRepo = new BloqueioAgendaRepository();
  private configService = new ConfiguracaoService();

  async list(): Promise<Agendamento[]> {
    return await this.repository.all();
  }

  async find(id: string): Promise<Agendamento | null> {
    return await this.repository.find(id);
  }

  async listByProfessional(profissionalId: string): Promise<Agendamento[]> {
    return await this.repository.listByProfessional(profissionalId);
  }

  async listByPatient(pacienteId: string): Promise<Agendamento[]> {
    return await this.repository.listByPatient(pacienteId);
  }

  async create(data: Partial<Agendamento>): Promise<Agendamento> {
    await this.validateAndPrepare(data);

    return await this.repository.create({
      paciente_id: data.paciente_id,
      profissional_id: data.profissional_id,
      servico_id: data.servico_id,
      inicio: data.inicio,
      fim: data.fim,
      status: data.status || "PENDENTE",
      observacao: data.observacao || null,
    });
  }

  async update(id: string, data: Partial<Agendamento>): Promise<Agendamento> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Agendamento não encontrado");

    const merged = { ...existing, ...data };
    await this.validateAndPrepare(merged, id);

    const updateData: Partial<Agendamento> = {};
    if (data.paciente_id !== undefined) updateData.paciente_id = data.paciente_id;
    if (data.profissional_id !== undefined) updateData.profissional_id = data.profissional_id;
    if (data.servico_id !== undefined) updateData.servico_id = data.servico_id;
    if (data.inicio !== undefined) updateData.inicio = data.inicio;
    if (data.fim !== undefined) updateData.fim = data.fim;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.observacao !== undefined) updateData.observacao = data.observacao;

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Agendamento não encontrado");
    return await this.repository.delete(id);
  }

  private async validateAndPrepare(data: Partial<Agendamento>, excludeId?: string): Promise<void> {
    if (!data.paciente_id) throw new Error("paciente_id é obrigatório");
    if (!data.profissional_id) throw new Error("profissional_id é obrigatório");
    if (!data.servico_id) throw new Error("servico_id é obrigatório");
    if (!data.inicio) throw new Error("Horário de início é obrigatório");
    if (!data.fim) throw new Error("Horário de término é obrigatório");

    const start = new Date(data.inicio);
    const end = new Date(data.fim);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de data/hora inválido para início ou término");
    }

    if (start >= end) {
      throw new Error("Horário de início deve ser anterior ao de término");
    }

    const patient = await this.pacienteRepo.find(data.paciente_id);
    if (!patient) throw new Error("Paciente não cadastrado");

    const professional = await this.profissionalRepo.find(data.profissional_id);
    if (!professional) throw new Error("Profissional não cadastrado");
    if (!professional.ativo) throw new Error("Este profissional não está ativo");

    const service = await this.servicoRepo.find(data.servico_id);
    if (!service) throw new Error("Serviço não cadastrado");
    if (!service.ativo) throw new Error("Este serviço não está ativo");

    const config = await this.configService.getConfig();

    const dayOfWeek = start.getDay(); 
    if (!config.dias_funcionamento.includes(dayOfWeek)) {
      throw new Error("O estabelecimento não funciona no dia selecionado");
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;
    const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;

    if (startStr < config.hora_abertura || endStr > config.hora_fechamento) {
      throw new Error(
        `Horário solicitado (${startStr.slice(0, 5)} - ${endStr.slice(0, 5)}) está fora do horário de funcionamento (${config.hora_abertura.slice(0, 5)} às ${config.hora_fechamento.slice(0, 5)})`
      );
    }

    if (startStr < config.almoco_fim && endStr > config.almoco_inicio) {
      throw new Error(
        `O horário solicitado entra em conflito com o intervalo de almoço (${config.almoco_inicio.slice(0, 5)} às ${config.almoco_fim.slice(0, 5)})`
      );
    }

    const overlaps = await this.repository.findOverlapping(
      data.profissional_id,
      data.inicio,
      data.fim,
      excludeId
    );
    if (overlaps.length > 0) {
      throw new Error("O profissional já possui um agendamento conflitante neste horário");
    }

    const blocks = await this.bloqueioRepo.findOverlapping(
      data.profissional_id,
      data.inicio,
      data.fim
    );
    if (blocks.length > 0) {
      throw new Error(`A agenda do profissional está bloqueada neste horário: ${blocks[0].motivo}`);
    }
  }
}
