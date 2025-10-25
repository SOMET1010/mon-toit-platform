import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSmartPagination } from '../src/hooks/use-smart-pagination';
import { renderHook, act } from '@testing-library/react';

// Test data
const mockData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
  value: Math.random() * 100
}));

describe('useSmartPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should paginate data correctly', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10
      })
    );

    expect(result.current.currentItems).toHaveLength(10);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10
      })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(true);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10
      })
    );

    // First go to page 2
    act(() => {
      result.current.nextPage();
    });

    // Then go back to page 1
    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should filter data based on search', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 20,
        searchKeys: ['name']
      })
    );

    act(() => {
      result.current.setSearchValue('Item 1');
    });

    expect(result.current.filteredData.length).toBe(11); // Items 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
    expect(result.current.currentItems.length).toBe(11);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: [],
        pageSize: 10
      })
    );

    expect(result.current.currentItems).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should sort data correctly', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10,
        sortBy: 'value',
        sortOrder: 'desc'
      })
    );

    const firstItem = result.current.currentItems[0];
    const secondItem = result.current.currentItems[1];
    
    expect(firstItem.value).toBeGreaterThanOrEqual(secondItem.value);
  });

  it('should reset pagination when search changes', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10,
        searchKeys: ['name']
      })
    );

    // Navigate to page 2
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);

    // Change search (should reset to page 1)
    act(() => {
      result.current.setSearchValue('Item');
    });

    expect(result.current.currentPage).toBe(1);
  });
});

describe('SmartPagination Performance', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: i
    }));

    const startTime = performance.now();
    
    const { result } = renderHook(() => 
      useSmartPagination({
        data: largeDataset,
        pageSize: 20,
        searchKeys: ['name']
      })
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(result.current.currentItems).toHaveLength(20);
    expect(executionTime).toBeLessThan(100); // Should complete within 100ms
  });

  it('should maintain performance with search operations', () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10,
        searchKeys: ['name', 'category']
      })
    );

    const searchOperations = Array.from({ length: 10 }, (_, i) => 
      `Item ${i + 1}`
    );

    const startTime = performance.now();
    
    searchOperations.forEach(searchTerm => {
      act(() => {
        result.current.setSearchValue(searchTerm);
      });
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Should handle 10 search operations within reasonable time
    expect(executionTime).toBeLessThan(200);
  });
});

describe('SmartPagination Integration', () => {
  it('should work with infinite scroll', async () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10,
        enableInfiniteScroll: true,
        prefetchThreshold: 3
      })
    );

    // Mock intersection observer for infinite scroll simulation
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    act(() => {
      result.current.nextPage();
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle concurrent operations', async () => {
    const { result } = renderHook(() => 
      useSmartPagination({
        data: mockData,
        pageSize: 10
      })
    );

    // Perform multiple operations concurrently
    await act(async () => {
      await Promise.all([
        result.current.nextPage(),
        result.current.nextPage(),
        result.current.goToPage(5),
        result.current.setSearchValue('Item')
      ]);
    });

    // Should handle all operations without errors
    expect(result.current.currentPage).toBe(1); // Search resets to page 1
    expect(result.current.searchValue).toBe('Item');
    expect(result.current.filteredData.length).toBeGreaterThan(0);
  });
});

export {};