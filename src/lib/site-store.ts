/**
 * Adaptateur Supabase pour le singleton `site_content`.
 * Lectures publiques via `supabasePublic` (RLS), écritures via `supabaseAdmin`.
 */

import { supabaseAdmin, supabasePublic } from "@/lib/supabase";
import { SiteContent } from "@/types/site";
import { mergeSiteContent } from "@/lib/site-defaults";
import { StoreError } from "@/lib/store";

const SINGLETON_ID = "singleton";

interface Row {
  id: string;
  data: unknown;
  updated_at: string;
}

function mapError(operation: string, error: { message: string; code?: string }) {
  return new StoreError(`${operation}: ${error.message}`, error);
}

export async function readSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabasePublic
    .from("site_content")
    .select("id, data, updated_at")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) throw mapError("readSiteContent", error);
  return mergeSiteContent((data as Row | null)?.data);
}

export async function readSiteContentAdmin(): Promise<SiteContent> {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("id, data, updated_at")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) throw mapError("readSiteContentAdmin", error);
  return mergeSiteContent((data as Row | null)?.data);
}

export async function upsertSiteContent(
  content: SiteContent
): Promise<SiteContent> {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .upsert({ id: SINGLETON_ID, data: content })
    .select("id, data, updated_at")
    .single();

  if (error) throw mapError("upsertSiteContent", error);
  return mergeSiteContent((data as Row).data);
}
