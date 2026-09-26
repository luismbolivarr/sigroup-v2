import { describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./supabaseConfig";

describe("getSupabaseConfig", () => {
  it("returns config when both environment variables are present", () => {
    expect(getSupabaseConfig("https://example.supabase.co", "anon-key")).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("throws when URL is missing", () => {
    expect(() => getSupabaseConfig(undefined, "anon-key")).toThrow(
      /Faltan las variables de entorno/
    );
  });

  it("throws when anon key is missing", () => {
    expect(() => getSupabaseConfig("https://example.supabase.co", undefined)).toThrow(
      /Faltan las variables de entorno/
    );
  });
});
