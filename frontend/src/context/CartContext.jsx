import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CART_KEY = 'nexed_cart_v1';
const CartContext = createContext();

// Reducer to manage cart state
function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload };
    
    case 'ADD_ITEM': {
      const { courseId, price, title } = action.payload;
      const exists = state.items.some(item => {
        const itemId = item.course?._id || item.course;
        return itemId === courseId;
      });
      
      if (exists) {
        return state;
      }
      
      return {
        ...state,
        items: [...state.items, { course: courseId, price, title, addedAt: new Date().toISOString() }]
      };
    }
    
    case 'REMOVE_ITEM': {
      const courseId = action.payload;
      return {
        ...state,
        items: state.items.filter(item => {
          const itemId = item.course?._id || item.course;
          return itemId !== courseId;
        })
      };
    }
    
    case 'CLEAR':
      return { ...state, items: [] };
    
    default:
      return state;
  }
}

// Initialize cart from localStorage
function initCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch (e) {
    console.error('Error loading cart from localStorage:', e);
    return { items: [] };
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasMergedRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [state]);

  // Merge guest cart with server cart when user logs in
  const mergeLocalWithServer = useCallback(async () => {
    if (hasMergedRef.current) return;
    
    try {
      setIsLoading(true);
      const guestItems = state.items || [];
      
      console.log('[CART] Merging guest cart with server cart:', guestItems.length, 'items');
      
      const response = await api.post('/cart/merge', { guestItems });
      
      if (response.data?.success) {
        const serverCart = response.data.data?.cart;
        if (serverCart) {
          dispatch({ type: 'SET_CART', payload: serverCart.items || [] });
          console.log('[CART] Merge successful:', serverCart.items?.length || 0, 'total items');
        }
        hasMergedRef.current = true;
      }
    } catch (err) {
      console.error('[CART] Error merging cart:', err);
      setError(err.response?.data?.message || 'Failed to merge cart');
    } finally {
      setIsLoading(false);
    }
  }, [state.items]);

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/cart');
      
      if (response.data?.success) {
        const serverCart = response.data.data?.cart;
        if (serverCart) {
          dispatch({ type: 'SET_CART', payload: serverCart.items || [] });
        }
      }
    } catch (err) {
      console.error('[CART] Error fetching cart:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Sync cart to server (for authenticated users)
  const syncCartToServer = useCallback(async () => {
    if (!isAuthenticated) return false;
    
    try {
      await api.post('/cart', { items: state.items });
      return true;
    } catch (err) {
      console.warn('[CART] Error syncing to server:', err);
      return false;
    }
  }, [isAuthenticated, state.items]);

  // Handle auth state changes
  useEffect(() => {
    const wasAuth = prevAuthRef.current;
    const isAuth = isAuthenticated;
    
    if (!wasAuth && isAuth) {
      // User just logged in - merge guest cart
      console.log('[CART] User logged in, merging cart...');
      hasMergedRef.current = false;
      mergeLocalWithServer();
    } else if (wasAuth && !isAuth) {
      // User logged out - reset merge flag
      console.log('[CART] User logged out');
      hasMergedRef.current = false;
      dispatch({ type: 'CLEAR' });
    } else if (isAuth && !hasMergedRef.current) {
      // Already authenticated, fetch server cart
      fetchCart();
    }
    
    prevAuthRef.current = isAuth;
  }, [isAuthenticated, mergeLocalWithServer, fetchCart]);

  // Add item to cart with optimistic updates
  const addToCart = useCallback(async (courseId, price = 0, title = '') => {
    try {
      setError(null);
      
      // Input validation
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      if (price < 0) {
        throw new Error('Invalid price');
      }
      
      // Check if already in cart to avoid duplicate requests
      const exists = state.items.some(item => {
        const itemId = item.course?._id || item.course;
        return itemId === courseId;
      });
      
      if (exists) {
        throw new Error('Course already in cart');
      }
      
      if (!isAuthenticated) {
        // Guest mode: add to localStorage only
        dispatch({ type: 'ADD_ITEM', payload: { courseId, price, title } });
        return { success: true, message: 'Added to cart! Login to save across devices.' };
      }
      
      // Optimistic update for better UX
      dispatch({ type: 'ADD_ITEM', payload: { courseId, price, title } });
      
      try {
        // Authenticated: add to server
        const response = await api.post(`/cart/${courseId}`);
        
        if (response.data?.success) {
          const serverCart = response.data.data?.cart;
          if (serverCart) {
            dispatch({ type: 'SET_CART', payload: serverCart.items || [] });
          }
          return { success: true, message: response.data.message || 'Added to cart!' };
        }
        
        throw new Error(response.data?.message || 'Failed to add to cart');
      } catch (serverError) {
        // Rollback optimistic update on server error
        dispatch({ type: 'REMOVE_ITEM', payload: courseId });
        throw serverError;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add to cart';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [isAuthenticated, state.items]);

  // Remove item from cart with optimistic updates
  const removeFromCart = useCallback(async (courseId) => {
    try {
      setError(null);
      
      // Validation
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      
      // Store original item for rollback
      const originalItem = state.items.find(item => {
        const itemId = item.course?._id || item.course;
        return itemId === courseId;
      });
      
      if (!originalItem && !isAuthenticated) {
        throw new Error('Course not found in cart');
      }
      
      if (!isAuthenticated) {
        // Guest mode: remove from localStorage only
        dispatch({ type: 'REMOVE_ITEM', payload: courseId });
        return { success: true, message: 'Removed from cart!' };
      }
      
      // Optimistic update for better UX
      dispatch({ type: 'REMOVE_ITEM', payload: courseId });
      
      try {
        // Authenticated: remove from server
        const response = await api.delete(`/cart/${courseId}`);
        
        if (response.data?.success) {
          const serverCart = response.data.data?.cart;
          if (serverCart) {
            dispatch({ type: 'SET_CART', payload: serverCart.items || [] });
          }
          return { success: true, message: response.data.message || 'Removed from cart!' };
        }
        
        throw new Error(response.data?.message || 'Failed to remove from cart');
      } catch (serverError) {
        // Rollback optimistic update on server error
        if (originalItem) {
          dispatch({ type: 'ADD_ITEM', payload: {
            courseId: originalItem.course?._id || originalItem.course,
            price: originalItem.price,
            title: originalItem.title || originalItem.course?.title
          }});
        }
        throw serverError;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to remove from cart';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [isAuthenticated, state.items]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Guest mode: clear localStorage only
        dispatch({ type: 'CLEAR' });
        return { success: true, message: 'Cart cleared!' };
      }
      
      // Authenticated: clear from server
      const response = await api.delete('/cart');
      
      if (response.data?.success) {
        dispatch({ type: 'CLEAR' });
        return { success: true, message: response.data.message || 'Cart cleared!' };
      }
      
      throw new Error(response.data?.message || 'Failed to clear cart');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to clear cart';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [isAuthenticated]);

  // Check if course is in cart
  const isInCart = useCallback((courseId) => {
    return state.items.some(item => {
      const itemId = item.course?._id || item.course;
      return itemId === courseId;
    });
  }, [state.items]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return state.items.reduce((total, item) => {
      const price = item.course?.pricing?.amount || item.course?.price || item.price || 0;
      return total + price;
    }, 0);
  }, [state.items]);

  const value = {
    cart: state,
    cartItems: state.items,
    cartCount: state.items.length,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
    syncCartToServer,
    mergeLocalWithServer,
    isInCart,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;
