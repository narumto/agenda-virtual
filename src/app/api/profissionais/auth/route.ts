import { NextRequest, NextResponse } from "next/server";
import { ProfissionalAuthService } from "@/backend/services/ProfissionalAuthService";
import { signProToken, verifyProToken, COOKIE_NAME } from "@/backend/lib/proJwt";

const service = new ProfissionalAuthService();

/** POST /api/profissionais/auth — Login */
export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    const profissional = await service.login(email, senha);

    const token = await signProToken({
      id: profissional.id,
      nome: profissional.nome,
      email: profissional.email,
      categoria: profissional.categoria,
    });

    const res = NextResponse.json({
      message: "Login realizado com sucesso",
      data: {
        id: profissional.id,
        nome: profissional.nome,
        email: profissional.email,
        categoria: profissional.categoria,
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
    return NextResponse.json(
      { message: e.message || "Erro ao fazer login", needsPasswordSetup: e.needsPasswordSetup || false },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ message: "Logout realizado" });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyProToken(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, data: session });
}
