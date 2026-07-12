import { BaseRepository } from "./BaseRepository";
import { Paciente } from "../models/types";
import { supabase } from "../database/client";

export class PacienteRepository extends BaseRepository<Paciente, string> {
  constructor() {
    super("pacientes", "id");
  }

  async findByEmail(email: string): Promise<Paciente | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return data as Paciente | null;
  }

  async findByGoogleId(googleId: string): Promise<Paciente | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("google_id", googleId)
      .maybeSingle();

    if (error) throw error;
    return data as Paciente | null;
  }
}
