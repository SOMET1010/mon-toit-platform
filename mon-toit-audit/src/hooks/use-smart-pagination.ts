import { useState, useEffect, useCallback, useMemo } from 'react';

interface SmartPaginationOptions<T> {
  data: T[];
  pageSize?: number;
  maxPages?: number;
  enableInfiniteScroll?: boolean;
  prefetchThreshold?: number; // Prefetch when this many items from end
  searchKeys?: (keyof T)[]; // Keys to search in
  searchValue?: string;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

interface SmartPaginationReturn<T> {
  // Current page data
  currentItems: T[];
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Search and filter
  filteredData: T[];
  searchValue: string;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchValue: (value: string) => void;
  resetPagination: () => void;
  
  // Stats
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export function useSmartPagination<T>({
  data,
  pageSize = 20,
  maxPages = 50,
  enableInfiniteScroll = true,
  prefetchThreshold = 3,
  searchKeys = [],
  searchValue: externalSearchValue,
  sortBy,
  sortOrder = 'asc'
}: SmartPaginationOptions<T>): SmartPaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchValue = externalSearchValue ?? internalSearchValue;

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue || searchKeys.length === 0) return data;
    
    return data.filter(item => 
      searchKeys.some(key => {
        const value = item[key];
        return String(value).toLowerCase().includes(searchValue.toLowerCase());
      })
    );
  }, [data, searchValue, searchKeys]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortOrder]);

  // Calculate total pages based on filtered and sorted data
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedData.length / pageSize));
  }, [sortedData.length, pageSize]);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, sortedData.length);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Pagination state
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedData.length);
  const totalItems = sortedData.length;

  // Prefetch next page data
  const prefetchNextPage = useCallback(() => {
    if (!enableInfiniteScroll || !hasNextPage || isLoading) return;
    
    const nextPageStart = currentPage * pageSize;
    const nextPageEnd = Math.min(nextPageStart + pageSize, sortedData.length);
    
    // Trigger prefetch by creating a promise (this would be replaced with actual data fetching)
    Promise.resolve(sortedData.slice(nextPageStart, nextPageEnd)).then(() => {
      // Prefetch completed
    });
  }, [currentPage, pageSize, hasNextPage, enableInfiniteScroll, isLoading, sortedData]);

  // Auto-advance page if near end of current page
  useEffect(() => {
    if (!enableInfiniteScroll) return;
    
    const itemsRemaining = totalItems - endIndex;
    if (itemsRemaining <= prefetchThreshold && hasNextPage) {
      // Optionally auto-advance or prefetch
      prefetchNextPage();
    }
  }, [currentItems.length, endIndex, totalItems, prefetchThreshold, hasNextPage, enableInfiniteScroll, prefetchNextPage]);

  // Actions
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => Math.min(prev + 1, maxPages));
    }
  }, [hasNextPage, maxPages]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, maxPages));
    setCurrentPage(targetPage);
  }, [maxPages]);

  const setPageSize = useCallback((size: number) => {
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const setSearchValue = useCallback((value: string) => {
    setInternalSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setInternalSearchValue('');
  }, []);

  return {
    currentItems,
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    filteredData: sortedData,
    searchValue,
    isLoading,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    setSearchValue,
    resetPagination,
    totalItems,
    startIndex,
    endIndex
  };
}

export default useSmartPagination;