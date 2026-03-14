/**
 * Supabase Client Wrapper
 * Centralized Supabase client initialization with connection pooling and error handling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

/**
 * Get Supabase client for public operations (uses anon key)
 * Uses connection pooling URL for better performance
 * 
 * @returns {SupabaseClient} Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Use pooler URL for connection pooling (better performance)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      // Connection pool configuration
      global: {
        headers: {
          'x-connection-opts': JSON.stringify({
            pooler: true,
            statement_timeout: 30000,
          }),
        },
      },
    })
  }

  return supabaseClient
}

/**
 * Get Supabase admin client for server-side operations (uses service role key)
 * Uses connection pooler for better performance
 * 
 * @returns {SupabaseClient} Supabase admin client instance
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    // Use pooler URL for connection pooling (better performance)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase admin environment variables')
    }

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      // Connection pool configuration
      global: {
        headers: {
          'x-connection-opts': JSON.stringify({
            pooler: true,
            statement_timeout: 30000,
          }),
        },
      },
    })
  }

  return supabaseAdminClient
}

/**
 * Test Supabase connection
 * 
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error: any) {
    console.error('Supabase connection test error:', error.message)
    return false
  }
}
