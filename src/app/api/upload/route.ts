import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "uploads";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "Arquivo muito grande. Máximo: 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ message: "Formato de arquivo não permitido" }, { status: 400 });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type || `image/${ext}`,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json({ message: error.message || "Erro ao enviar arquivo" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ message: e.message || "Erro no upload" }, { status: 500 });
  }
}
