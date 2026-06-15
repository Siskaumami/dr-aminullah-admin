type SupabaseInsertPayload = Record<string, unknown>;

type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * File ini hanya contoh client Supabase.
 * Saat backend sudah aktif, ganti mock ini dengan Supabase client asli.
 */
export const supabase = {
  from(tableName: string) {
    return {
      insert(payload: SupabaseInsertPayload) {
        return {
          select() {
            return {
              async single(): Promise<SupabaseResponse<SupabaseInsertPayload & { table: string }>> {
                return {
                  data: {
                    table: tableName,
                    ...payload
                  },
                  error: null
                };
              }
            };
          }
        };
      }
    };
  }
};