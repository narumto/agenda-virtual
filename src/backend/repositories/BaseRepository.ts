import { supabase } from "../database/client";

export class BaseRepository<T, IDType = string> {
  constructor(protected tableName: string, protected primaryKeyName: string = "id") {}

  async all(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*");
    
    if (error) {
      throw error;
    }
    return data as T[];
  }

  async find(id: IDType): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq(this.primaryKeyName, id)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data as T | null;
  }

  async create(item: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item as any)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as T;
  }

  async update(id: IDType, item: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item as any)
      .eq(this.primaryKeyName, id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as T;
  }

  async delete(id: IDType): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq(this.primaryKeyName, id);

    if (error) {
      throw error;
    }
    return true;
  }
}
