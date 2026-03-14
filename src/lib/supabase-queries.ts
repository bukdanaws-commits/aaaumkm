/**
 * Supabase Query Abstraction Layer
 * Provides reusable query functions that abstract Supabase client operations
 * Type-safe CRUD operations with error handling
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface QueryOptions {
  select?: string
  filters?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }[]
  limit?: number
  offset?: number
}

export interface QueryResult<T> {
  data: T[] | null
  error: Error | null
  count?: number
}

export interface SingleResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Find many records with optional filtering, sorting, and pagination
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param options - Query options (select, filters, orderBy, limit, offset)
 * @returns Promise with data array, error, and count
 */
export async function findMany<T = any>(
  client: SupabaseClient,
  table: string,
  options?: QueryOptions
): Promise<QueryResult<T>> {
  try {
    let query = client.from(table).select(options?.select || '*', { count: 'exact' })

    // Apply filters
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      for (const order of options.orderBy) {
        query = query.order(order.column, { ascending: order.ascending ?? true })
      }
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      const limit = options?.limit || 10
      query = query.range(options.offset, options.offset + limit - 1)
    }

    const { data, error, count } = await query

    return {
      data: data as T[],
      error: error ? new Error(error.message) : null,
      count: count ?? undefined,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Query failed'),
      count: 0,
    }
  }
}

/**
 * Find a single record by ID
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param id - Record ID
 * @param select - Optional select string
 * @returns Promise with single record or null
 */
export async function findOne<T = any>(
  client: SupabaseClient,
  table: string,
  id: string,
  select?: string
): Promise<SingleResult<T>> {
  try {
    const { data, error } = await client
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single()

    return {
      data: data as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Query failed'),
    }
  }
}

/**
 * Find a single record by custom filter
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param filters - Filter object
 * @param select - Optional select string
 * @returns Promise with single record or null
 */
export async function findOneBy<T = any>(
  client: SupabaseClient,
  table: string,
  filters: Record<string, any>,
  select?: string
): Promise<SingleResult<T>> {
  try {
    let query = client.from(table).select(select || '*')

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { data, error } = await query.single()

    return {
      data: data as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Query failed'),
    }
  }
}

/**
 * Create a new record
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param data - Data to insert
 * @returns Promise with created record
 */
export async function create<T = any>(
  client: SupabaseClient,
  table: string,
  data: Record<string, any>
): Promise<SingleResult<T>> {
  try {
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select()
      .single()

    return {
      data: result as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Create failed'),
    }
  }
}

/**
 * Create multiple records
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param data - Array of data to insert
 * @returns Promise with created records
 */
export async function createMany<T = any>(
  client: SupabaseClient,
  table: string,
  data: Record<string, any>[]
): Promise<QueryResult<T>> {
  try {
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select()

    return {
      data: result as T[],
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Create many failed'),
    }
  }
}

/**
 * Update a record by ID
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param id - Record ID
 * @param data - Data to update
 * @returns Promise with updated record
 */
export async function update<T = any>(
  client: SupabaseClient,
  table: string,
  id: string,
  data: Record<string, any>
): Promise<SingleResult<T>> {
  try {
    const { data: result, error } = await client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    return {
      data: result as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Update failed'),
    }
  }
}

/**
 * Update records by custom filter
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param filters - Filter object
 * @param data - Data to update
 * @returns Promise with updated records
 */
export async function updateMany<T = any>(
  client: SupabaseClient,
  table: string,
  filters: Record<string, any>,
  data: Record<string, any>
): Promise<QueryResult<T>> {
  try {
    let query = client.from(table).update(data)

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { data: result, error } = await query.select()

    return {
      data: result as T[],
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Update many failed'),
    }
  }
}

/**
 * Delete a record by ID
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param id - Record ID
 * @returns Promise with error if any
 */
export async function remove(
  client: SupabaseClient,
  table: string,
  id: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await client.from(table).delete().eq('id', id)

    return {
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      error: new Error(error.message || 'Delete failed'),
    }
  }
}

/**
 * Delete records by custom filter
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param filters - Filter object
 * @returns Promise with error if any
 */
export async function removeMany(
  client: SupabaseClient,
  table: string,
  filters: Record<string, any>
): Promise<{ error: Error | null }> {
  try {
    let query = client.from(table).delete()

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { error } = await query

    return {
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      error: new Error(error.message || 'Delete many failed'),
    }
  }
}

/**
 * Count records with optional filters
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param filters - Optional filter object
 * @returns Promise with count
 */
export async function count(
  client: SupabaseClient,
  table: string,
  filters?: Record<string, any>
): Promise<{ count: number; error: Error | null }> {
  try {
    let query = client.from(table).select('*', { count: 'exact', head: true })

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      }
    }

    const { count: result, error } = await query

    return {
      count: result ?? 0,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      count: 0,
      error: new Error(error.message || 'Count failed'),
    }
  }
}

/**
 * Execute a stored procedure (RPC)
 * 
 * @param client - Supabase client instance
 * @param functionName - Function name
 * @param params - Function parameters
 * @returns Promise with function result
 */
export async function rpc<T = any>(
  client: SupabaseClient,
  functionName: string,
  params?: Record<string, any>
): Promise<SingleResult<T>> {
  try {
    const { data, error } = await client.rpc(functionName, params)

    return {
      data: data as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'RPC call failed'),
    }
  }
}

/**
 * Upsert a record (insert or update on conflict)
 * 
 * @param client - Supabase client instance
 * @param table - Table name
 * @param data - Data to upsert
 * @param onConflict - Columns to conflict on (for update)
 * @returns Promise with upserted record
 */
export async function upsert<T = any>(
  client: SupabaseClient,
  table: string,
  data: Record<string, any>,
  onConflict?: string
): Promise<SingleResult<T>> {
  try {
    let query = client.from(table).upsert(data)

    if (onConflict) {
      query = query.onConflict(onConflict)
    }

    const { data: result, error } = await query.select().single()

    return {
      data: result as T,
      error: error ? new Error(error.message) : null,
    }
  } catch (error: any) {
    return {
      data: null,
      error: new Error(error.message || 'Upsert failed'),
    }
  }
}
