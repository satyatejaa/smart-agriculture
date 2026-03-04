import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wytdbpaaloxpyrkucyxt.supabase.co'
const supabaseKey = 'sb_publishable_2plwUslHaB-0i0XaxHtHqw_NjCQAwB2'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
}

// Create the supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection (optional - can be removed in production)
supabase
  .from('crops')
  .select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error)
    } else {
      console.log('✅ Supabase connected! Found', count, 'crops')
    }
  })

// Check credentials (optional debug)
console.log('🔐 Supabase URL:', supabaseUrl)
console.log('🔐 Supabase Key exists:', !!supabaseKey)

export default supabase