"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  AlertCircle,
  Save,
  Clock,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import { Paciente, FichaTratamento, SessaoTratamento } from "@/types";
import { FichaTratamentoPrintable } from "./FichaTratamentoPrintable";

interface FichaTratamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Paciente | null;
  agendamentoId?: string;
  servicoNome?: string;
}

export function FichaTratamentoModal({
  isOpen,
  onClose,
  paciente,
  agendamentoId,
  servicoNome,
}: FichaTratamentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [savingPaciente, setSavingPaciente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Patient editable extra fields
  const [dataNascimento, setDataNascimento] = useState("");
  const [nif, setNif] = useState("");

  // Fichas state
  const [fichas, setFichas] = useState<FichaTratamento[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<string | null>(null);

  // New Ficha form state
  const [showNewFichaForm, setShowNewFichaForm] = useState(false);
  const [procedimentoZona, setProcedimentoZona] = useState("");
  const [sessoesAdquiridas, setSessoesAdquiridas] = useState(10);
  const [validadeFicha, setValidadeFicha] = useState("");
  const [obsGeraisFicha, setObsGeraisFicha] = useState("");
  const [creatingFicha, setCreatingFicha] = useState(false);

  // New Session form state
  const [showNewSessaoForm, setShowNewSessaoForm] = useState(false);
  const [numSessao, setNumSessao] = useState(1);
  const [zonaTratada, setZonaTratada] = useState("");
  const [potencia, setPotencia] = useState("");
  const [ponteira, setPonteira] = useState("");
  const [obsSessao, setObsSessao] = useState("");
  const [dataSessao, setDataSessao] = useState(new Date().toISOString().split("T")[0]);
  const [savingSessao, setSavingSessao] = useState(false);

  // General notes save state for selected ficha
  const [observacoesGerais, setObservacoesGerais] = useState("");

  // Initialize patient data and fetch fichas
  useEffect(() => {
    if (paciente) {
      setDataNascimento(paciente.data_nascimento ? paciente.data_nascimento.split("T")[0] : "");
      setNif(paciente.nif || "");
      fetchFichas(paciente.id);
    }
  }, [paciente]);

  const fetchFichas = async (pacienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fichas?paciente_id=${pacienteId}`);
      if (!res.ok) {
        // Graceful fallback if table doesn't exist yet
        const errData = await res.json().catch(() => ({}));
        if (errData.message && errData.message.includes("Could not find the table")) {
          setError(
            "A tabela de fichas ainda não foi criada no Supabase. Por favor, execute o script 'supabase_fichas_tratamento.sql'."
          );
          setFichas([]);
          return;
        }
        throw new Error(errData.message || "Erro ao carregar fichas");
      }
      const data: FichaTratamento[] = await res.json();
      setFichas(data);
      if (data.length > 0) {
        setSelectedFichaId(data[0].id);
        setObservacoesGerais(data[0].observacoes_gerais || "");
        setZonaTratada(data[0].procedimento_zona || servicoNome || "");
        setNumSessao((data[0].sessoes?.length || 0) + 1);
      } else if (servicoNome) {
        setProcedimentoZona(servicoNome);
        setZonaTratada(servicoNome);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !paciente) return null;

  const currentFicha = fichas.find((f) => f.id === selectedFichaId) || fichas[0];

  const handleSavePacienteData = async () => {
    setSavingPaciente(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/pacientes/${paciente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data_nascimento: dataNascimento || null,
          nif: nif || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao atualizar dados do paciente");
      }

      setSuccessMsg("Dados do paciente salvos com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingPaciente(false);
    }
  };

  const handleCreateFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedimentoZona.trim()) {
      setError("Informe o procedimento / zona adquirida.");
      return;
    }
    setCreatingFicha(true);
    setError(null);
    try {
      const res = await fetch("/api/fichas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paciente_id: paciente.id,
          procedimento_zona: procedimentoZona.trim(),
          sessoes_adquiridas: sessoesAdquiridas,
          validade: validadeFicha || null,
          observacoes_gerais: obsGeraisFicha || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao criar ficha");
      }

      const newFicha: FichaTratamento = await res.json();
      setFichas([newFicha, ...fichas]);
      setSelectedFichaId(newFicha.id);
      setObservacoesGerais(newFicha.observacoes_gerais || "");
      setZonaTratada(newFicha.procedimento_zona);
      setShowNewFichaForm(false);
      setSuccessMsg("Ficha de tratamento criada!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingFicha(false);
    }
  };

  const handleAddSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFicha) {
      setError("Crie ou selecione uma ficha de procedimento antes de registrar uma sessão.");
      return;
    }
    if (!zonaTratada.trim()) {
      setError("Informe a zona tratada.");
      return;
    }
    setSavingSessao(true);
    setError(null);
    try {
      const res = await fetch(`/api/fichas/${currentFicha.id}/sessoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_sessao: numSessao,
          zona_tratada: zonaTratada.trim(),
          potencia: potencia.trim() || null,
          ponteira: ponteira.trim() || null,
          observacoes: obsSessao.trim() || null,
          agendamento_id: agendamentoId || null,
          data_sessao: dataSessao ? new Date(dataSessao).toISOString() : new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao registrar sessão");
      }

      const newSessao: SessaoTratamento = await res.json();
      const updatedFichas = fichas.map((f) => {
        if (f.id === currentFicha.id) {
          const prevSessoes = f.sessoes || [];
          return { ...f, sessoes: [...prevSessoes, newSessao] };
        }
        return f;
      });

      setFichas(updatedFichas);
      setShowNewSessaoForm(false);
      setPotencia("");
      setPonteira("");
      setObsSessao("");
      setNumSessao((currentFicha.sessoes?.length || 0) + 2);
      setSuccessMsg("Sessão registrada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingSessao(false);
    }
  };

  const handleDeleteSessao = async (sessaoId: string) => {
    if (!confirm("Deseja realmente excluir o registro desta sessão?")) return;
    try {
      const res = await fetch(`/api/fichas/${currentFicha?.id}/sessoes?sessao_id=${sessaoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao excluir sessão");
      }

      setFichas((prev) =>
        prev.map((f) => {
          if (f.id === currentFicha?.id) {
            return { ...f, sessoes: f.sessoes?.filter((s) => s.id !== sessaoId) };
          }
          return f;
        })
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveObsGerais = async () => {
    if (!currentFicha) return;
    try {
      const res = await fetch(`/api/fichas/${currentFicha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacoes_gerais: observacoesGerais }),
      });

      if (!res.ok) throw new Error("Erro ao salvar observações.");

      setSuccessMsg("Observações salvas!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 my-8 overflow-hidden transition-all">
        
        {/* Header Elegante (Estilo Cristiane Vasconcelos Clinic) */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="text-amber-400" size={24} />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-medium">
              Cristiane Vasconcelos Clinic
            </span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-amber-100 tracking-wide">
            Controlo de Tratamento — Depilação a Laser
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Ficha clínica e acompanhamento de evolução técnica de sessões
          </p>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">

          {/* 1. DADOS DA CLIENTE (PRÉ-PREENCHIDOS) */}
          <section className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-xl border border-stone-200 dark:border-stone-700/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <User size={16} /> Dados da Cliente
              </h3>
              <button
                onClick={handleSavePacienteData}
                disabled={savingPaciente}
                className="text-xs px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save size={14} />
                {savingPaciente ? "Salvando..." : "Salvar Dados"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome Completo</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium">
                  <User size={14} className="text-stone-400 shrink-0" />
                  <span className="truncate">{paciente.nome}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Telemóvel</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200">
                  <Phone size={14} className="text-stone-400 shrink-0" />
                  <span>{paciente.telefone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">E-mail</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200">
                  <Mail size={14} className="text-stone-400 shrink-0" />
                  <span className="truncate">{paciente.email || "Não informado"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">NIF (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: 123456789"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. PROCEDIMENTOS ADQUIRIDOS / SELEÇÃO DE FICHA */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <FileText size={16} /> Procedimentos Adquiridos
              </h3>
              <button
                onClick={() => setShowNewFichaForm(!showNewFichaForm)}
                className="text-xs px-3 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 rounded-lg transition-colors flex items-center gap-1 shadow-sm font-medium"
              >
                <Plus size={14} /> Novo Tratamento
              </button>
            </div>

            {/* Form de Nova Ficha */}
            {showNewFichaForm && (
              <form onSubmit={handleCreateFicha} className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">Cadastrar Novo Plano/Zona</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Procedimento / Zona *</label>
                    <input
                      type="text"
                      placeholder="ex: Perfil / Percevejo / Pernas Inteiras"
                      value={procedimentoZona}
                      onChange={(e) => setProcedimentoZona(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nº Sessões Adquiridas</label>
                    <input
                      type="number"
                      min={1}
                      value={sessoesAdquiridas}
                      onChange={(e) => setSessoesAdquiridas(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Validade (Data)</label>
                    <input
                      type="date"
                      value={validadeFicha}
                      onChange={(e) => setValidadeFicha(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFichaForm(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingFicha}
                    className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium shadow"
                  >
                    {creatingFicha ? "Criando..." : "Salvar Ficha"}
                  </button>
                </div>
              </form>
            )}

            {/* Selector de Fichas Existentes */}
            {fichas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fichas.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFichaId(f.id);
                      setObservacoesGerais(f.observacoes_gerais || "");
                      setZonaTratada(f.procedimento_zona);
                      setNumSessao((f.sessoes?.length || 0) + 1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                      f.id === currentFicha?.id
                        ? "bg-amber-900 text-amber-100 border-amber-800 shadow-sm"
                        : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Sparkles size={12} className={f.id === currentFicha?.id ? "text-amber-400" : "text-stone-400"} />
                    <span>{f.procedimento_zona}</span>
                    <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded bg-black/20">
                      {f.sessoes?.length || 0}/{f.sessoes_adquiridas} sessões
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Nenhum procedimento cadastrado ainda. Clique em "Novo Tratamento" para adicionar o pacote de depilação a laser.
              </p>
            )}
          </section>

          {/* 3. ACOMPANHAMENTO DAS SESSÕES (EVOLUÇÃO TÉCNICA) */}
          {currentFicha && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <Activity size={16} /> Acompanhamento das Sessões
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Histórico de disparos, zonas tratadas, potência e ponteira utilizada
                  </p>
                </div>
                <button
                  onClick={() => setShowNewSessaoForm(!showNewSessaoForm)}
                  className="text-xs px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-1 font-medium shadow-sm"
                >
                  <Zap size={14} /> Registrar Nova Sessão
                </button>
              </div>

              {/* Form de Nova Sessão */}
              {showNewSessaoForm && (
                <form onSubmit={handleAddSessao} className="p-4 bg-stone-100 dark:bg-stone-800/80 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3 shadow-inner">
                  <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase flex items-center gap-1.5">
                    <Zap size={14} /> Registrar Evolução Técnica da Sessão
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Data da Sessão</label>
                      <input
                        type="date"
                        value={dataSessao}
                        onChange={(e) => setDataSessao(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Sessão Nº</label>
                      <input
                        type="number"
                        min={1}
                        value={numSessao}
                        onChange={(e) => setNumSessao(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Zona Tratada *</label>
                      <input
                        type="text"
                        placeholder="ex: Axilas / Buço"
                        value={zonaTratada}
                        onChange={(e) => setZonaTratada(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Potência (ex: 18 J/cm²)</label>
                      <input
                        type="text"
                        placeholder="ex: 18 J/cm² ou Nível 4"
                        value={potencia}
                        onChange={(e) => setPotencia(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Ponteira</label>
                      <input
                        type="text"
                        placeholder="ex: Spot 12mm / HR"
                        value={ponteira}
                        onChange={(e) => setPonteira(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Observações da Sessão</label>
                      <input
                        type="text"
                        placeholder="ex: Reação de eritema normal, cliente tolera bem"
                        value={obsSessao}
                        onChange={(e) => setObsSessao(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSessaoForm(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingSessao}
                      className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium shadow"
                    >
                      {savingSessao ? "Registrando..." : "Confirmar e Registrar Sessão"}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabela de Sessões */}
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Sessão</th>
                      <th className="p-3">Zona Tratada</th>
                      <th className="p-3">Potência</th>
                      <th className="p-3">Ponteira</th>
                      <th className="p-3">Observações</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
                    {currentFicha.sessoes && currentFicha.sessoes.length > 0 ? (
                      currentFicha.sessoes.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="p-3 font-medium text-stone-800 dark:text-stone-200">
                            {new Date(s.data_sessao).toLocaleDateString("pt-PT")}
                          </td>
                          <td className="p-3 font-semibold text-amber-800 dark:text-amber-400">
                            {s.numero_sessao}ª Sessão
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">{s.zona_tratada}</td>
                          <td className="p-3 font-mono text-stone-600 dark:text-stone-400">
                            {s.potencia || "—"}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-400">{s.ponteira || "—"}</td>
                          <td className="p-3 text-stone-500 dark:text-stone-400 max-w-xs truncate">
                            {s.observacoes || "—"}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteSessao(s.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                              title="Excluir sessão"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-stone-400 italic">
                          Nenhuma sessão registrada nesta ficha ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. OBSERVAÇÕES GERAIS DA FICHA */}
          {currentFicha && (
            <section className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Observações Gerais da Ficha
                </label>
                <button
                  onClick={handleSaveObsGerais}
                  className="text-xs px-3 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded-lg transition-colors"
                >
                  Salvar Observações
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Anotações gerais sobre o tratamento, patologias ou avisos da cliente..."
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-xl font-semibold hover:opacity-95 transition-all shadow-sm flex items-center gap-2"
          >
            <Printer size={16} />
            <span>Imprimir / Exportar Ficha Oficial (PDF)</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Concluído / Fechar
          </button>
        </div>

      </div>

      {/* Componente Oculto em Tela, Ativado Apenas no window.print() */}
      <FichaTratamentoPrintable paciente={paciente} ficha={currentFicha} />
    </div>
  );
}
