import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ochujlrskwybjtxizffp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jaHVqbHJza3d5Ymp0eGl6ZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzIxOTcsImV4cCI6MjA3MjE0ODE5N30._rLg4Wmcdsu0TxVJYJuB20bu0oVmPgLdKnyDV52Fglk'
)