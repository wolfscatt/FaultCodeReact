/**
 * Mock for @supabase/supabase-js
 * Prevents real network calls during testing
 * Returns mock data that matches the expected Supabase response format
 */

export const createClient = jest.fn(() => ({
  from: jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: {message: 'Mock: Supabase not available in tests'},
          }),
        ),
        eq: jest.fn(() =>
          Promise.resolve({
            data: [],
            error: {message: 'Mock: Supabase not available in tests'},
          }),
        ),
      })),
      eq: jest.fn(() =>
        Promise.resolve({
          data: [],
          error: {message: 'Mock: Supabase not available in tests'},
        }),
      ),
      order: jest.fn(() => ({
        limit: jest.fn(() =>
          Promise.resolve({
            data: [],
            error: {message: 'Mock: Supabase not available in tests'},
          }),
        ),
        eq: jest.fn(() =>
          Promise.resolve({
            data: [],
            error: {message: 'Mock: Supabase not available in tests'},
          }),
        ),
      })),
      limit: jest.fn(() =>
        Promise.resolve({
          data: [],
          error: {message: 'Mock: Supabase not available in tests'},
        }),
      ),
      single: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: {message: 'Mock: Supabase not available in tests'},
        }),
      ),
    })),
    insert: jest.fn(() =>
      Promise.resolve({
        data: null,
        error: {message: 'Mock: Supabase not available in tests'},
      }),
    ),
    update: jest.fn(() => ({
      eq: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: {message: 'Mock: Supabase not available in tests'},
        }),
      ),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() =>
        Promise.resolve({
          data: null,
          error: {message: 'Mock: Supabase not available in tests'},
        }),
      ),
    })),
  })),
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({
        data: {session: null},
        error: null,
      }),
    ),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        data: {user: null, session: null},
        error: {message: 'Mock: Auth not available in tests'},
      }),
    ),
    signOut: jest.fn(() =>
      Promise.resolve({
        error: null,
      }),
    ),
    onAuthStateChange: jest.fn(() => ({
      data: {subscription: {unsubscribe: jest.fn()}},
    })),
  },
}));

// Export mock SupabaseClient type
export type SupabaseClient = ReturnType<typeof createClient>;

