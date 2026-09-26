import { describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./supabaseConfig";

const expectedErrorMessage =
  "Faltan variables de entorno requeridas: VITE_SUPABASE_URL. Copia .env.example a .env y rellena los valores de Supabase.";

describe("getSupabaseConfig", () => {
  it("returns config when both environment variables are present", () => {
    expect(getSupabaseConfig("https://example.supabase.co", "anon-key")).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("throws when URL is missing", () => {
    expect(() => getSupabaseConfig(undefined, "anon-key")).toThrowError(
      expectedErrorMessage
    );
  });

  it("throws when URL is empty", () => {
    expect(() => getSupabaseConfig("", "anon-key")).toThrow(
      /VITE_SUPABASE_URL/
    );
  });

  it("throws when anon key is missing", () => {
    expect(() => getSupabaseConfig("https://example.supabase.co", undefined)).toThrow(
      /VITE_SUPABASE_ANON_KEY/
    );
  });

  it("throws when anon key is empty", () => {
    expect(() => getSupabaseConfig("https://example.supabase.co", "")).toThrow(
      /VITE_SUPABASE_ANON_KEY/
    );
  });

  it("throws when both values are missing", () => {
    expect(() => getSupabaseConfig(undefined, undefined)).toThrow(
      /VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY/
    );
  });
});
