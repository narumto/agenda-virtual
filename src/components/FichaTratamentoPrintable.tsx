"use client";

import React from "react";
import { Paciente, FichaTratamento } from "@/types";

interface FichaTratamentoPrintableProps {
  paciente: Paciente;
  ficha?: FichaTratamento | null;
  mode?: "image" | "vector"; // "image" sobrepõe sobre a foto original do cliente, "vector" usa HTML limpo
}

export function FichaTratamentoPrintable({ paciente, ficha, mode = "image" }: FichaTratamentoPrintableProps) {
  const sessoes = ficha?.sessoes || [];
  const sessoesAdquiridasCount = ficha?.sessoes_adquiridas || 10;

  const formatDate = (dStr?: string | null) => {
    if (!dStr) return "";
    const match = String(dStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dStr;
    }
  };

  return (
    <div id="ficha-printable" className="hidden print:block bg-white text-stone-900 font-sans max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
      
      {/* Estilos de Impressão A4 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ficha-printable, #ficha-printable * {
            visibility: visible;
          }
          #ficha-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* MÓDULO 1: SOBREPOSIÇÃO SOBRE A IMAGEM ORIGINAL DO CLIENTE */}
      <div className="relative w-full aspect-[682/1024] overflow-hidden bg-white">
        
        {/* Imagem de Fundo Oficial da Clínica */}
        <img
          src="/ficha-depilacao.png"
          alt="Ficha de Controlo de Tratamento Depilação a Laser"
          className="w-full h-full object-cover block"
        />

        {/* Mapeamento de Sobreposição em Coordenadas Percentuais */}
        <div className="absolute inset-0 text-stone-900 font-sans text-[11px] leading-tight select-none">
          
          {/* 1. DADOS DA CLIENTE */}
          {/* Nome completo */}
          <div
            className="absolute font-semibold text-stone-900 flex items-center px-1"
            style={{ top: "26.3%", left: "20.5%", width: "72%", height: "2.0%" }}
          >
            {paciente.nome || ""}
          </div>

          {/* Data de nascimento */}
          <div
            className="absolute font-medium text-stone-900 flex items-center justify-start tracking-wider px-1 text-[11px]"
            style={{ top: "28.5%", left: "20.5%", width: "31%", height: "2.0%" }}
          >
            {formatDate(paciente.data_nascimento)}
          </div>

          {/* Telemóvel */}
          <div
            className="absolute font-semibold text-stone-900 flex items-center px-1"
            style={{ top: "28.5%", left: "66.5%", width: "26%", height: "2.0%" }}
          >
            {paciente.telefone || ""}
          </div>

          {/* E-mail */}
          <div
            className="absolute text-stone-900 flex items-center px-1"
            style={{ top: "30.8%", left: "12.5%", width: "80%", height: "2.0%" }}
          >
            {paciente.email || ""}
          </div>

          {/* NIF */}
          <div
            className="absolute text-stone-900 flex items-center px-1"
            style={{ top: "33.1%", left: "16.5%", width: "76%", height: "2.0%" }}
          >
            {paciente.nif || ""}
          </div>


          {/* 2. PROCEDIMENTOS ADQUIRIDOS (TABELA 1) */}
          {/* Linha 1 */}
          <div
            className="absolute font-medium text-stone-900 flex items-center justify-center text-center px-1"
            style={{ top: "42.5%", left: "5.0%", width: "34.0%", height: "2.4%" }}
          >
            {ficha?.procedimento_zona || "Depilação a Laser"}
          </div>
          <div
            className="absolute text-stone-900 flex items-center justify-center text-center"
            style={{ top: "42.5%", left: "39.5%", width: "18.5%", height: "2.4%" }}
          >
            {formatDate(ficha?.data_aquisicao) || formatDate(new Date().toISOString())}
          </div>
          <div
            className="absolute text-stone-900 flex items-center justify-center text-center font-semibold"
            style={{ top: "42.5%", left: "58.5%", width: "17.0%", height: "2.4%" }}
          >
            {sessoesAdquiridasCount}
          </div>
          <div
            className="absolute text-stone-900 flex items-center justify-center text-center"
            style={{ top: "42.5%", left: "76.0%", width: "19.0%", height: "2.4%" }}
          >
            {formatDate(ficha?.validade) || "—"}
          </div>


          {/* 3. ACOMPANHAMENTO DAS SESSÕES (TABELA 2 - Até 4 Linhas na foto) */}
          {sessoes.slice(0, 4).map((s, idx) => {
            const topPositions = ["59.6%", "62.1%", "64.6%", "67.1%"];
            const currentTop = topPositions[idx];

            return (
              <React.Fragment key={s.id || idx}>
                {/* Data */}
                <div
                  className="absolute text-stone-900 flex items-center justify-center text-center text-[10px]"
                  style={{ top: currentTop, left: "4.5%", width: "12.5%", height: "2.2%" }}
                >
                  {formatDate(s.data_sessao)}
                </div>

                {/* Sessão */}
                <div
                  className="absolute font-semibold text-stone-900 flex items-center justify-center text-center text-[10px]"
                  style={{ top: currentTop, left: "17.2%", width: "9.8%", height: "2.2%" }}
                >
                  {s.numero_sessao}ª
                </div>

                {/* Zona Tratada */}
                <div
                  className="absolute font-medium text-stone-900 flex items-center justify-center text-center text-[10px] px-1 truncate"
                  style={{ top: currentTop, left: "27.2%", width: "21.3%", height: "2.2%" }}
                >
                  {s.zona_tratada}
                </div>

                {/* Potência */}
                <div
                  className="absolute font-mono text-stone-900 flex items-center justify-center text-center text-[10px]"
                  style={{ top: currentTop, left: "48.8%", width: "14.8%", height: "2.2%" }}
                >
                  {s.potencia || "—"}
                </div>

                {/* Ponteira */}
                <div
                  className="absolute text-stone-900 flex items-center justify-center text-center text-[10px]"
                  style={{ top: currentTop, left: "63.8%", width: "12.8%", height: "2.2%" }}
                >
                  {s.ponteira || "—"}
                </div>

                {/* Observações */}
                <div
                  className="absolute text-stone-900 flex items-center px-1 text-[9px] truncate"
                  style={{ top: currentTop, left: "76.8%", width: "18.5%", height: "2.2%" }}
                >
                  {s.observacoes || ""}
                </div>
              </React.Fragment>
            );
          })}


          {/* 4. OBSERVAÇÕES GERAIS */}
          <div
            className="absolute text-stone-900 px-2 py-0.5 text-[10px] leading-snug overflow-hidden"
            style={{ top: "85.0%", left: "21.0%", width: "74.0%", height: "3.5%" }}
          >
            {ficha?.observacoes_gerais || ""}
          </div>

          {/* Data do Rodapé */}
          <div
            className="absolute text-stone-900 flex items-center justify-center text-center text-[10px] font-semibold"
            style={{ top: "91.0%", left: "5.5%", width: "15.0%", height: "2.0%" }}
          >
            {formatDate(new Date().toISOString())}
          </div>

        </div>

      </div>

    </div>
  );
}
