import { supabase } from './supabase'

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function saveScoresCloud(scores: Record<string, number>) {
  const session = await getSession()
  if (!session) throw new Error('Not signed in')

  const { error } = await supabase