import supabase from "@/lib/supabaseServer";

export const revalidate = 0; // no cache

export async function GET() {
  const { data, error } = await supabase.rpc("get_category_averages");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return Response.json(data ?? []);
}