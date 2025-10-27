import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { queryOptimizer } from '../src/lib/supabase-optimizer';
import { globalCache } from '../src/lib/adaptive-cache';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
  },
}));

const mockSupabaseData = [
  { id: 1, name: 'Test Property 1', city: 'Abidjan', status: 'disponible' },
  { id: 2, name: 'Test Property 2', city: 'Bouaké', status: 'disponible' },
  { id: 3, name: 'Test Property 3', city: 'Yamoussoukro', status: 'loue' },
];

describe('Supabase Query Optimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Query Operations', () => {
    it('should create a basic query', () => {
      const query = queryOptimizer.createQuery('properties');
      
      expect(query).toHaveProperty('select');
      expect(query).toHaveProperty('execute');
      expect(query).toHaveProperty('buildCacheKey');
    });

    it('should execute a basic query successfully', async () => {
      const mockExecute = vi.fn().mockResolvedValue(mockSupabaseData);
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
        }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      const result = await query.execute();

      expect(result).toEqual(mockSupabaseData);
      expect(supabase.from).toHaveBeenCalledWith('properties');
    });

    it('should apply filters correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ 
            data: mockSupabaseData.filter(p => p.status === 'disponible'), 
            error: null 
          }),
        }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      const result = await query.execute({
        filters: { status: 'disponible' }
      });

      expect(result).toHaveLength(2);
      expect(result.every(p => p.status === 'disponible')).toBe(true);
    });

    it('should apply ordering correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
        }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      await query.execute({
        orderBy: { column: 'name', ascending: true }
      });

      expect(supabase.from).toHaveBeenCalledWith('properties');
    });
  });

  describe('Caching', () => {
    it('should cache query results', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      
      // First call should hit database
      const result1 = await query.execute({ cache: true });
      expect(result1).toEqual(mockSupabaseData);
      
      // Second call should hit cache
      const result2 = await query.execute({ cache: true });
      expect(result2).toEqual(mockSupabaseData);
      
      // Should only call supabase once (database hit)
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('should handle cache misses correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      
      // First call with cache disabled
      const result1 = await query.execute({ cache: false });
      expect(result1).toEqual(mockSupabaseData);
      
      // Second call with different options should also hit database
      const result2 = await query.execute({ cache: true });
      expect(result2).toEqual(mockSupabaseData);
      
      // Should call supabase twice
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('should respect cache TTL', async () => {
      vi.useFakeTimers();
      
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      
      // Set very short TTL
      await query.execute({ cache: true, cacheTTL: 100 });
      
      // Advance time past TTL
      vi.advanceTimersByTime(101);
      
      // Should hit database again
      await query.execute({ cache: true });
      
      expect(supabase.from).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Batch Queries', () => {
    it('should execute batch queries efficiently', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const batchQueries = [
        { table: 'properties', options: { filters: { status: 'disponible' } } },
        { table: 'profiles', options: { limit: 10 } },
        { table: 'applications', options: { orderBy: { column: 'created_at', ascending: false } } },
      ];

      const results = await queryOptimizer.batchQuery(batchQueries);

      expect(results).toHaveProperty('properties');
      expect(results).toHaveProperty('profiles');
      expect(results).toHaveProperty('applications');
      expect(results.properties).toEqual(mockSupabaseData);
    });

    it('should handle batch query failures gracefully', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'properties') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
          };
        } else {
          return {
            select: vi.fn().mockRejectedValue(new Error('Database error')),
          };
        }
      });

      const batchQueries = [
        { table: 'properties', options: {} },
        { table: 'nonexistent_table', options: {} },
      ];

      const results = await queryOptimizer.batchQuery(batchQueries);

      expect(results.properties).toEqual(mockSupabaseData);
      expect(results.nonexistent_table).toBeNull();
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache for predicted queries', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const predictedQueries = [
        { table: 'properties', options: { cache: true } },
        { table: 'profiles', options: { cache: true, limit: 10 } },
      ];

      await queryOptimizer.warmCache(predictedQueries);

      // All predicted queries should be cached
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent queries efficiently', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const startTime = performance.now();
      
      const promises = Array.from({ length: 10 }, (_, i) => 
        queryOptimizer.createQuery('properties').execute({ 
          cache: true, 
          cacheKey: `query_${i}` 
        })
      );

      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should optimize cache hit rate', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockSupabaseData, error: null }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      
      // Execute same query multiple times
      await Promise.all([
        query.execute({ cache: true, cacheKey: 'test_query' }),
        query.execute({ cache: true, cacheKey: 'test_query' }),
        query.execute({ cache: true, cacheKey: 'test_query' }),
        query.execute({ cache: true, cacheKey: 'test_query' }),
      ]);

      const stats = queryOptimizer.getCacheStats();
      
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Database connection failed') 
        }),
      } as any);

      const query = queryOptimizer.createQuery('properties');
      
      await expect(query.execute()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid query options', async () => {
      const query = queryOptimizer.createQuery('properties');
      
      // Test with invalid range
      const result = await query.execute({
        range: { from: 100, to: 50 } // Invalid range
      });

      expect(result).toBeNull(); // Should handle gracefully
    });
  });
});

export {};