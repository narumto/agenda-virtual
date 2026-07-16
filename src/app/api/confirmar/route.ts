import { NextRequest, NextResponse } from "next/server";
import { AgendamentoService } from "@/backend/services/AgendamentoService";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return new NextResponse(
        `<html>
          <head>
            <title>Link Inválido - Agenda Virtual</title>
            <meta charset="utf-8" />
          </head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #FAF9F6; margin:0;">
            <div style="text-align: center; border: 1px solid #fecaca; background-color: #fef2f2; color: #b91c1c; padding: 30px; border-radius: 20px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <h2 style="margin-top: 0;">Link Inválido</h2>
              <p>O link de confirmação não contém um identificador válido.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 }
      );
    }

    const service = new AgendamentoService();
    const agendamento = await service.find(id);

    if (!agendamento) {
      return new NextResponse(
        `<html>
          <head>
            <title>Não Encontrado - Agenda Virtual</title>
            <meta charset="utf-8" />
          </head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #FAF9F6; margin:0;">
            <div style="text-align: center; border: 1px solid #fecaca; background-color: #fef2f2; color: #b91c1c; padding: 30px; border-radius: 20px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <h2 style="margin-top: 0;">Agendamento Não Encontrado</h2>
              <p>Não encontramos nenhum agendamento correspondente a este identificador.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 404 }
      );
    }

    if (agendamento.status === "CONFIRMADO") {
      return new NextResponse(
        `<html>
          <head>
            <title>Já Confirmado - Agenda Virtual</title>
            <meta charset="utf-8" />
          </head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #FAF9F6; margin:0;">
            <div style="text-align: center; border: 1px solid #d1fae5; background-color: #ecfdf5; color: #065f46; padding: 30px; border-radius: 20px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <h2 style="margin-top: 0; color: #047857;">Já Confirmado</h2>
              <p>Este agendamento já foi confirmado anteriormente. Obrigado!</p>
              <a href="/" style="margin-top: 15px; display: inline-block; background-color: #C49A82; color: white; padding: 8px 20px; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: bold;">Ir para o Site</a>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    await service.update(id, { status: "CONFIRMADO" });

    console.log("DISPARAR_BOT_WHATSAPP: Chamar função para enviar mensagem de confirmação do agendamento ID:", id);
    
    return new NextResponse(
      `<html>
        <head>
          <title>Agendamento Confirmado - Agenda Virtual</title>
          <meta charset="utf-8" />
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #FAF9F6; margin:0;">
          <div style="text-align: center; border: 1px solid #e2d1c3; background-color: #ffffff; color: #2b2723; padding: 40px; border-radius: 30px; max-width: 450px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05);">
            <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #f5ede6; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C49A82" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style="margin-top: 0; font-family: Georgia, serif; color: #C49A82; font-weight: normal;">Agendamento Confirmado!</h2>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">O seu horário foi confirmado com sucesso no nosso sistema. Estamos ansiosos para atender você!</p>
            <hr style="border: 0; border-top: 1px solid #f3ebe4; margin: 25px 0;" />
            <a href="/" style="display: inline-block; background-color: #C49A82; color: white; padding: 10px 25px; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: bold; transition: background 0.2s;">Ir para o Site</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (e: any) {
    return new NextResponse(
      `<html>
        <head>
          <title>Erro de Confirmação - Agenda Virtual</title>
          <meta charset="utf-8" />
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #FAF9F6; margin:0;">
          <div style="text-align: center; border: 1px solid #fecaca; background-color: #fef2f2; color: #b91c1c; padding: 30px; border-radius: 20px; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h2 style="margin-top: 0;">Erro de Confirmação</h2>
            <p>Ocorreu um erro ao tentar confirmar seu agendamento: ${e.message || "Erro desconhecido"}</p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}
