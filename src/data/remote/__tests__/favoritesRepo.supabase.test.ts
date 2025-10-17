/**
 * Tests for Supabase Favorites Repository
 * Tests favorites CRUD operations and gating logic
 */

import {addFavorite, removeFavorite, listFavorites, isFavorited, getFavoritesCount} from '../favoritesRepo.supabase';
import {supabase} from '@lib/supabase';

// Mock Supabase client
jest.mock('@lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock usePrefsStore
jest.mock('@state/usePrefsStore', () => ({
  usePrefsStore: {
    getState: () => ({language: 'en'}),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Favorites Repository (Supabase)', () => {
  const mockUserId = 'user-123';
  const mockFaultId = 'fault-456';
  const mockFavorites = [
    {
      id: 'fav-1',
      user_id: mockUserId,
      fault_code_id: mockFaultId,
      created_at: '2023-01-01T00:00:00Z',
      fault_codes: {
        id: mockFaultId,
        brand_id: 'brand-1',
        code: 'F28',
        title: {en: 'Ignition failure', tr: 'Ateşleme hatası'},
        severity: 'critical' as const,
        summary: {en: 'Boiler fails to ignite', tr: 'Kazan ateşleme yapamıyor'},
        causes: {en: ['Gas issue'], tr: ['Gaz sorunu']},
        safety_notice: {en: 'Check gas supply', tr: 'Gaz beslemesini kontrol edin'},
        last_verified_at: '2023-01-01',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a new favorite successfully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {id: 'fav-123'},
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await addFavorite(mockUserId, mockFaultId);

      expect(result.created).toBe(true);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('favorites');
    });

    it('should handle duplicate favorites gracefully (idempotent)', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: {code: '23505', message: 'duplicate key'},
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await addFavorite(mockUserId, mockFaultId);

      expect(result.created).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: {code: '500', message: 'Database error'},
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await addFavorite(mockUserId, mockFaultId);

      expect(result.created).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      const result = await removeFavorite(mockUserId, mockFaultId);

      expect(result.removed).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle removal errors', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: {code: '500', message: 'Database error'},
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      const result = await removeFavorite(mockUserId, mockFaultId);

      expect(result.removed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('listFavorites', () => {
    it('should return user favorites with fault details', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockFavorites,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await listFavorites(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockFaultId);
      expect(result[0].code).toBe('F28');
      expect(result[0].title).toBe('Ignition failure');
    });

    it('should return empty array on error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: {code: '500', message: 'Database error'},
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await listFavorites(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('isFavorited', () => {
    it('should return true if fault is favorited', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {id: 'fav-123'},
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await isFavorited(mockUserId, mockFaultId);

      expect(result.isFavorited).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return false if fault is not favorited', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {code: 'PGRST116', message: 'No rows found'},
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await isFavorited(mockUserId, mockFaultId);

      expect(result.isFavorited).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('getFavoritesCount', () => {
    it('should return correct count', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          count: 5,
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await getFavoritesCount(mockUserId);

      expect(result.count).toBe(5);
      expect(result.error).toBeNull();
    });

    it('should return 0 on error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          count: null,
          error: {code: '500', message: 'Database error'},
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await getFavoritesCount(mockUserId);

      expect(result.count).toBe(0);
      expect(result.error).toBeDefined();
    });
  });
});
