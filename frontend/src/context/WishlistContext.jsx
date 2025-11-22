import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    // Initialize from localStorage if available
    try {
      const cached = localStorage.getItem('wishlistItems');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const cached = localStorage.getItem('wishlistCount');
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track pending operations to prevent duplicates
  const [pendingOperations, setPendingOperations] = useState(new Set());

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
      localStorage.setItem('wishlistCount', wishlistCount.toString());
    } else {
      localStorage.removeItem('wishlistItems');
      localStorage.removeItem('wishlistCount');
    }
  }, [wishlistItems, wishlistCount, isAuthenticated]);

  // Fetch wishlist items from backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await wishlistService.getWishlist();
      
      if (response.success) {
        const items = response.data?.wishlist?.items || [];
        setWishlistItems(items);
        setWishlistCount(items.length);
      } else {
        setWishlistItems([]);
        setWishlistCount(0);
      }
    } catch (err) {
      console.error('[WISHLIST CONTEXT] Error fetching wishlist:', err);
      setError(err.message);
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load wishlist on mount and when auth changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if course is in wishlist
  const isInWishlist = useCallback((courseId) => {
    return wishlistItems.some(item => {
      // Handle both populated and non-populated course data
      const itemCourseId = item.course?._id || item.course;
      return itemCourseId === courseId;
    });
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (courseId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    // Prevent duplicate adds
    if (isInWishlist(courseId)) {
      return { success: false, message: 'Course is already in your wishlist' };
    }

    try {
      setError(null);
      const response = await wishlistService.addToWishlist(courseId);
      
      if (response.success) {
        // Update local state immediately
        const items = response.data?.wishlist?.items || [];
        setWishlistItems(items);
        setWishlistCount(items.length);
        return { success: true, message: response.message || 'Added to wishlist!' };
      } else {
        throw new Error(response.message || 'Failed to add to wishlist');
      }
    } catch (err) {
      console.error('[WISHLIST CONTEXT] Error adding to wishlist:', err);
      setError(err.message);
      
      // If it's a 400 error (already in wishlist), refresh the wishlist to sync state
      if (err.response?.status === 400) {
        await fetchWishlist();
      }
      
      throw err;
    }
  }, [isAuthenticated, isInWishlist, fetchWishlist]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (courseId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to manage wishlist');
    }

    // Prevent removing items that aren't in wishlist
    if (!isInWishlist(courseId)) {
      return { success: false, message: 'Course is not in your wishlist' };
    }

    try {
      setError(null);
      const response = await wishlistService.removeFromWishlist(courseId);
      
      if (response.success) {
        // Update local state immediately
        const items = response.data?.wishlist?.items || [];
        setWishlistItems(items);
        setWishlistCount(items.length);
        return { success: true, message: response.message || 'Removed from wishlist!' };
      } else {
        throw new Error(response.message || 'Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('[WISHLIST CONTEXT] Error removing from wishlist:', err);
      setError(err.message);
      
      // If there's an error, refresh the wishlist to sync state
      await fetchWishlist();
      
      throw err;
    }
  }, [isAuthenticated, isInWishlist, fetchWishlist]);

  // Toggle wishlist (add if not in, remove if already in)
  const toggleWishlist = useCallback(async (courseId) => {
    // Prevent duplicate operations
    if (pendingOperations.has(courseId)) {
      console.log('[WISHLIST CONTEXT] Operation already in progress for:', courseId);
      return { success: false, message: 'Operation already in progress' };
    }

    try {
      // Mark operation as pending
      setPendingOperations(prev => new Set([...prev, courseId]));
      
      const inWishlist = isInWishlist(courseId);
      
      if (inWishlist) {
        return await removeFromWishlist(courseId);
      } else {
        return await addToWishlist(courseId);
      }
    } finally {
      // Remove from pending operations
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist, pendingOperations]);

  const value = {
    wishlistItems,
    wishlistCount,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    fetchWishlist,
    isInWishlist,
    pendingOperations
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
