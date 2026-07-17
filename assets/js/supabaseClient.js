/**
 * Supabase Client Configuration
 * Initialize Supabase client for portfolio frontend
 */

// Supabase configuration
const SUPABASE_URL = 'https://fsqmrtxeubguzviixniq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcW1ydHhldWJndXp2aWl4bmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzk1NTksImV4cCI6MjA4NDkxNTU1OX0.Lw3mH4Io_RWJaCSj_Cg27HaNFfEf53vJtHFf2XV1_pk';

// Simple Supabase client implementation
class SupabaseClient {
    constructor(url, anonKey) {
        this.url = url;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
        };
    }

    /**
     * Query builder for SELECT operations
     * @param {string} table - Table name
     * @returns {QueryBuilder}
     */
    from(table) {
        return new QueryBuilder(this.url, this.headers, table);
    }
}

class QueryBuilder {
    constructor(url, headers, table) {
        this.url = url;
        this.headers = headers;
        this.table = table;
        this.queryParams = [];
        this.selectFields = '*';
    }

    /**
     * Select specific fields
     * @param {string} fields - Comma-separated field names or '*'
     */
    select(fields = '*') {
        this.selectFields = fields;
        return this;
    }

    /**
     * Filter by equality
     * @param {string} column - Column name
     * @param {any} value - Value to match
     */
    eq(column, value) {
        this.queryParams.push(`${column}=eq.${encodeURIComponent(value)}`);
        return this;
    }

    /**
     * Order results
     * @param {string} column - Column to order by
     * @param {object} options - { ascending: boolean }
     */
    order(column, options = { ascending: true }) {
        const direction = options.ascending ? 'asc' : 'desc';
        this.queryParams.push(`order=${column}.${direction}`);
        return this;
    }

    /**
     * Limit number of results
     * @param {number} count - Max number of rows
     */
    limit(count) {
        this.queryParams.push(`limit=${count}`);
        return this;
    }

    /**
     * Execute the query
     * @returns {Promise<{data, error}>}
     */
    async execute() {
        try {
            const queryString = this.queryParams.length > 0
                ? '?' + this.queryParams.join('&')
                : '';

            const url = `${this.url}/rest/v1/${this.table}${queryString}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=representation'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Supabase error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            console.error('Supabase query error:', error);
            return { data: null, error: error.message };
        }
    }
}

// Create the global Supabase client instance used by all loader scripts
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
