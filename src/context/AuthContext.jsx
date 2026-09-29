import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  subscribeToAuth, 
  signUpUser, 
  signInUser, 
  signOutUser,
  signInWithGoogleProvider,
  sendOtpToEmail,
  verifyOtpCode,
  syncUserGuestOrdersApi,
  syncUserCartToFirestore,
  getUserCartFromFirestore,
  syncUserWishlistToFirestore,
  getUserWishlistFromFirestore,
  subscribeToUserProfile,
  saveUserProfileToFirestore
} from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'signup'

  // Cart & Wishlist Global State with instant LocalStorage fallback for guests
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('printigly_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('printigly_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync cartItems to LocalStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('printigly_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Sync wishlistItems to LocalStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('printigly_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {}
  }, [wishlistItems]);

  // Subscribe to Firebase Auth state & User Profile Document
  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Real-time listener to Firestore user document
        unsubscribeProfile = subscribeToUserProfile(user.uid, (data) => {
          if (data) {
            setUserProfile(data);
            if (data.cart && Array.isArray(data.cart) && data.cart.length > 0) {
              setCartItems(data.cart);
            }
            if (data.wishlist && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
              setWishlistItems(data.wishlist);
            }
          }
        });

        // Initial fetch from Firestore
        const savedCart = await getUserCartFromFirestore(user.uid);
        const savedWishlist = await getUserWishlistFromFirestore(user.uid);
        if (savedCart && savedCart.length > 0) {
          setCartItems(savedCart);
        } else {
          // Sync existing guest localStorage cart to Firestore if user had cart before signing in
          const localCart = JSON.parse(localStorage.getItem('printigly_cart') || '[]');
          if (localCart.length > 0) {
            syncUserCartToFirestore(user.uid, localCart);
          }
        }

        if (savedWishlist && savedWishlist.length > 0) {
          setWishlistItems(savedWishlist);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const updateUserProfile = async (profileData) => {
    if (!currentUser) return false;
    setUserProfile(prev => ({ ...prev, ...profileData }));
    return await saveUserProfileToFirestore(currentUser.uid, profileData);
  };

  const saveAddress = async (newAddr) => {
    if (!currentUser) return false;
    const currentAddresses = userProfile?.addresses || [];
    const addrId = newAddr.id || `ADDR-${Date.now()}`;
    const formattedAddr = { ...newAddr, id: addrId };

    let updatedAddresses;
    if (newAddr.isDefault) {
      updatedAddresses = currentAddresses.map(a => ({ ...a, isDefault: false }));
      updatedAddresses.push(formattedAddr);
    } else {
      const existingIdx = currentAddresses.findIndex(a => a.id === addrId);
      if (existingIdx > -1) {
        updatedAddresses = [...currentAddresses];
        updatedAddresses[existingIdx] = formattedAddr;
      } else {
        updatedAddresses = [...currentAddresses, formattedAddr];
      }
    }

    return await updateUserProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = async (addrId) => {
    if (!currentUser) return false;
    const updated = (userProfile?.addresses || []).filter(a => a.id !== addrId);
    return await updateUserProfile({ addresses: updated });
  };

  const setDefaultAddress = async (addrId) => {
    if (!currentUser) return false;
    const updated = (userProfile?.addresses || []).map(a => ({
      ...a,
      isDefault: a.id === addrId
    }));
    return await updateUserProfile({ addresses: updated });
  };

  // Cart Operations
  const addToCart = (product) => {
    setCartItems(prev => {
      const cartItemId = product.cartItemId || `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItem = {
        cartItemId,
        id: product.id || Date.now(),
        productId: product.id,
        name: product.name || product.title,
        qty: product.qty || 100,
        quantity: product.qty || 100,
        selectedOptions: product.selectedOptions || {},
        paper: product.paper || '',
        finish: product.finish || '',
        sides: product.sides || '',
        customHeight: product.customHeight || null,
        customWidth: product.customWidth || null,
        calculatedArea: product.calculatedArea || null,
        areaTier: product.areaTier || null,
        areaPrice: product.areaPrice || 0,
        unitPrice: product.unitPrice || product.basePrice || 1.5,
        totalPrice: product.totalPrice || (product.qty * (product.unitPrice || 1.5)),
        image: product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
        artworkFiles: product.artworkFiles || [],
        artworkNotes: product.artworkNotes || '',
        uploadedFile: product.artworkFiles && product.artworkFiles.length > 0 ? product.artworkFiles[0].fileName : null
      };

      const updatedCart = [newItem, ...prev];

      if (currentUser) {
        syncUserCartToFirestore(currentUser.uid, updatedCart);
      }
      return updatedCart;
    });
  };

  const updateCartItem = (cartItemId, updatedFields) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.cartItemId === cartItemId || item.id === cartItemId) {
          const newQty = updatedFields.qty !== undefined ? updatedFields.qty : item.qty;
          const newUnitPrice = updatedFields.unitPrice !== undefined ? updatedFields.unitPrice : item.unitPrice;
          const newTotalPrice = updatedFields.totalPrice !== undefined ? updatedFields.totalPrice : (newQty * newUnitPrice);
          return {
            ...item,
            ...updatedFields,
            qty: newQty,
            quantity: newQty,
            totalPrice: newTotalPrice
          };
        }
        return item;
      });

      if (currentUser) {
        syncUserCartToFirestore(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId);
      if (currentUser) {
        syncUserCartToFirestore(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUser) {
      syncUserCartToFirestore(currentUser.uid, []);
    }
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
      } else {
        const newItem = {
          id: product.id || Date.now(),
          name: product.name || product.title,
          price: product.basePrice || product.price || 4.5,
          image: product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600'
        };
        updated = [newItem, ...prev];
      }

      if (currentUser) {
        syncUserWishlistToFirestore(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const login = async (email, password) => {
    const user = await signInUser(email, password);
    if (user && user.email) {
      await syncUserGuestOrdersApi(user.uid, user.email);
    }
    setAuthModalOpen(false);
    return user;
  };

  const signup = async (email, password, displayName, phone, company) => {
    const user = await signUpUser(email, password, displayName, phone, company);
    if (user && user.email) {
      await syncUserGuestOrdersApi(user.uid, user.email);
    }
    setAuthModalOpen(false);
    return user;
  };

  const loginWithGoogle = async () => {
    const user = await signInWithGoogleProvider();
    if (user && user.email) {
      await syncUserGuestOrdersApi(user.uid, user.email);
    }
    setAuthModalOpen(false);
    return user;
  };

  const sendOTP = async (email) => {
    return await sendOtpToEmail(email);
  };

  const verifyOTP = async (email, otp) => {
    const res = await verifyOtpCode(email, otp);
    if (res.uid && email) {
      await syncUserGuestOrdersApi(res.uid, email);
    }
    setAuthModalOpen(false);
    return res;
  };

  const logout = async () => {
    await signOutUser();
    setCartItems([]);
    setWishlistItems([]);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      updateUserProfile,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      loading,
      authModalOpen,
      setAuthModalOpen,
      authModalTab,
      setAuthModalTab,
      login,
      signup,
      loginWithGoogle,
      sendOTP,
      verifyOTP,
      logout,
      cartItems,
      setCartItems,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      wishlistItems,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

