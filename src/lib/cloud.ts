import { supabase } from './supabase'

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function saveScoresCloud(scores: Record<string, number>) {
  const session = await getSession()
  if (!session) throw new Error('Not signed in')

  const { error } = await supabase
    .from('user_scores')
    .upsert({
      user_id: session.user.id,
      scores,
      updated_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)
}

export async function loadScoresCloud(): Promise<Record<string, number>> {
  const session = await getSession()
  if (!session) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('user_scores')
    .select('scores')
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found, return empty scores
      return {}
    }
    throw new Error(error.message)
  }

  return data?.scores || {}
}

export async function saveScoreEvent(category: string, score: number, note?: string) {
  const session = await getSession()
  if (!session) throw new Error('Not signed in')

  const { error } = await supabase
    .from('user_score_events')
    .insert({
      user_id: session.user.id,
      category,
      score,
      note: note || null,
      created_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)
}

export async function getCategoryAverages() {
  const { data, error } = await supabase.rpc("get_category_averages");
  if (error) throw new Error(error.message);
  return data as Array<{ category: string; avg_score: number; samples: number }>;
}