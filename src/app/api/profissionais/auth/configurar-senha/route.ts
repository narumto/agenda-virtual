import { NextRequest, NextResponse } from "next/server";
import { ProfissionalRepository } from "@/backend/repositories/ProfissionalRepository";
import { signProToken, COOKIE_NAME } from "@/backend/lib/proJwt";
import bcrypt from "bcrypt";

const repo = new ProfissionalRepository();

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 });
    }

    if (senha.length < 8) {
      return NextResponse.json({ message: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 });
    }

    const pro = await repo.findByEmail(email.trim().toLowerCase());
    if (!pro) {
      return NextResponse.json({ message: "Profissional não cadastrado" }, { status: 404 });
    }

    if (pro.status_acesso !== "liberado") {
      return NextResponse.json({ message: "Cadastro ainda não liberado pelo administrador" }, { status: 403 });
    }

    if (pro.senha_hash) {
      return NextResponse.json({ message: "Senha já configurada anteriormente" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(senha, salt);

    const updated = await repo.update(pro.id, { senha_hash: hash });

    const token = await signProToken({
      id: updated.id,
      nome: updated.nome,
      email: updated.email!,
      categoria: updated.categoria,
    });

    const res = NextResponse.json({
      message: "Senha configurada e login efetuado com sucesso!",
      data: {
        id: updated.id,
        nome: updated.nome,
        email: updated.email,
        categoria: updated.categoria,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, 
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erro interno" }, { status: 500 });
  }
}
