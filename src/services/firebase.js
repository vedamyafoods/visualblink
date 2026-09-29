import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken
} from 'firebase/auth';

// Firebase Config initialized with live project credentials & env var fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhjJ-PpJRsPwa7jk7FIcbfhWj5rmG4TRM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "printing-1620d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "printing-1620d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "printing-1620d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "805681838557",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:805681838557:web:8b222db2ea987cd90f9e34",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F1K3KBMDGW"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// ── Firebase Auth Helpers ──
export const signUpUser = async (email, password, displayName, phone = '', company = '') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Save user profile document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName || user.email.split('@')[0],
    phone,
    company,
    createdAt: new Date().toISOString(),
    cart: [],
    wishlist: []
  });

  return user;
};

export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogleProvider = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync profile document in Firestore
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      cart: [],
      wishlist: []
    });
  }
  return user;
};

export const sendOtpToEmail = async (email) => {
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send OTP code.');
  }
  return data;
};

export const verifyOtpCode = async (email, otp) => {
  const response = await fetch('/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Invalid or expired OTP.');
  }
  return data;
};

export const syncUserGuestOrdersApi = async (uid, email) => {
  if (!uid || !email) return { syncedCount: 0 };
  try {
    const response = await fetch('/api/sync-guest-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email })
    });
    return await response.json();
  } catch (err) {
    console.warn("Error syncing guest orders:", err.message);
    return { syncedCount: 0 };
  }
};

export const createOrderOnServerApi = async (orderPayload) => {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to process order on server.');
  }
  return data.order;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuth = (onUserChanged) => {
  return onAuthStateChanged(auth, onUserChanged);
};

// ── Cart & Wishlist Firestore Sync ──
export const syncUserCartToFirestore = async (userId, cartItems) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { cart: cartItems }, { merge: true });
  } catch (err) {
    console.warn("Cart Firestore sync warning:", err.message);
  }
};

export const getUserCartFromFirestore = async (userId) => {
  if (!userId) return [];
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().cart || [];
    }
  } catch (err) {
    console.warn("Error fetching user cart:", err.message);
  }
  return [];
};

export const syncUserWishlistToFirestore = async (userId, wishlistItems) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { wishlist: wishlistItems }, { merge: true });
  } catch (err) {
    console.warn("Wishlist Firestore sync warning:", err.message);
  }
};

export const getUserWishlistFromFirestore = async (userId) => {
  if (!userId) return [];
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().wishlist || [];
    }
  } catch (err) {
    console.warn("Error fetching user wishlist:", err.message);
  }
  return [];
};

// ── User Profile & Address Book Firestore Helpers ──
export const subscribeToUserProfile = (userId, onUpdate) => {
  if (!userId) return () => { };
  try {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (err) => {
      console.warn("User profile listener note:", err.message);
    });
  } catch (err) {
    return () => { };
  }
};

export const saveUserProfileToFirestore = async (userId, profileData) => {
  if (!userId) return false;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Error saving user profile to Firestore:", err.message);
    return false;
  }
};

export const subscribeToUserOrders = (userId, userEmail, onUpdate) => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const userOrders = allOrders.filter(o =>
        (userId && o.userId === userId) ||
        (userEmail && o.customer?.email?.toLowerCase() === userEmail.toLowerCase())
      );
      onUpdate(userOrders);
    }, (err) => {
      console.warn("User orders subscription note:", err.message);
      onUpdate([]);
    });
  } catch (err) {
    onUpdate([]);
    return () => { };
  }
};

export const subscribeToOrderById = (orderId, onUpdate) => {
  if (!orderId) return () => { };
  try {
    const q = query(collection(db, 'orders'));
    return onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const cleanTarget = orderId.toLowerCase().trim();
      const matched = allOrders.find(o =>
        (o.orderId && o.orderId.toLowerCase() === cleanTarget) ||
        (o.id && o.id.toLowerCase() === cleanTarget)
      );
      onUpdate(matched || null);
    }, (err) => {
      console.warn("Order by ID subscription note:", err.message);
      onUpdate(null);
    });
  } catch (err) {
    onUpdate(null);
    return () => { };
  }
};



// ── Real-time Firestore Subscriptions for Admin & Storefront ──
export const subscribeToOrders = (onUpdate, onError) => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(orders);
    }, (err) => {
      console.warn("Firestore subscription note:", err.message);
      if (onError) onError(err);
    });
  } catch (err) {
    console.warn("Firebase listener fallback active.");
    return () => { };
  }
};

export const subscribeToProducts = (onUpdate) => {
  try {
    const q = query(collection(db, 'products'));
    return onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(prods);
    }, (err) => {
      console.warn("Firestore products subscription note:", err.message);
    });
  } catch (err) {
    return () => { };
  }
};

export const subscribeToDesignRequests = (onUpdate) => {
  try {
    const q = query(collection(db, 'design_requests'));
    return onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(reqs);
    }, (err) => {
      console.warn("Firestore design requests subscription note:", err.message);
    });
  } catch (err) {
    return () => { };
  }
};

// ── Firestore Write Operations ──
export const addOrderToFirestore = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn("Error adding order to Firestore:", err.message);
    return null;
  }
};

export const addProductToFirestore = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.warn("Error adding product to Firestore:", err.message);
    return null;
  }
};

export const addDesignRequestToFirestore = async (designData) => {
  try {
    const docRef = await addDoc(collection(db, 'design_requests'), {
      ...designData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.warn("Error adding design request to Firestore:", err.message);
    return null;
  }
};

export const updateProductInFirestore = async (productId, productData) => {
  try {
    const prodRef = doc(db, 'products', productId);
    await setDoc(prodRef, {
      ...productData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Updating product in Firestore note:", err.message);
    return false;
  }
};

export const deleteProductFromFirestore = async (productId) => {
  try {
    const prodRef = doc(db, 'products', productId);
    await deleteDoc(prodRef);
    return true;
  } catch (err) {
    console.warn("Deleting product from Firestore note:", err.message);
    return false;
  }
};

export const updateOrderStatusInFirestore = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn("Updating order status in local state:", err.message);
    return false;
  }
};

// ── Default Homepage Settings & Catalog Options ──
export const DEFAULT_HOMEPAGE_SETTINGS = {
  hero: {
    eyebrowText: "PRINTING MEETS CREATIVITY",
    headlineLine1: "Ideas in Print.",
    headlineLine2: "Impact in Real Life.",
    description: "Premium printing and design solutions for businesses, events and everyday needs.",
    bannerImage: "/hero_banner.png",
    badgeText: "Vibrant & Durable",
    productTitle: "Visual BLINK Print Studio",
    productSubtitle: "Turning your ideas into prints that people remember.",
    ratingText: "4.98 / 5.0 Rating",
    ratingSubtext: "From 50,000+ Verified Clients",
    primaryCtaText: "Explore Products",
    secondaryCtaText: "Get Custom Quote",
  },
  categoriesSection: {
    badgeText: "OUR PRODUCTS",
    headingLine1: "Shop by",
    headingHighlight: "Category",
    description: "Explore our wide range of premium printing products engineered for high precision and vibrant colors.",
    categories: [
      {
        id: "cat_1",
        name: 'Business Cards',
        sub: 'Premium quality cards with foil & matte finishes',
        img: 'https://images.unsplash.com/photo-1612831819695-7e71f5ccf16c?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiCreditCard',
      },
      {
        id: "cat_2",
        name: 'Brochures & Flyers',
        sub: 'Professional marketing & tri-fold materials',
        img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiBookOpen',
      },
      {
        id: "cat_3",
        name: 'Posters & Banners',
        sub: 'Large format outdoor & event displays',
        img: 'https://images.unsplash.com/photo-1608502374980-67d5c35a5302?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiTv',
      },
      {
        id: "cat_4",
        name: 'Invitations & Cards',
        sub: 'Special occasions & luxury embossed cards',
        img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiGift',
      },
      {
        id: "cat_5",
        name: 'Stickers & Labels',
        sub: 'Custom die-cut vinyl & roll labels',
        img: 'https://images.unsplash.com/photo-1591981730169-05e8e57a7c04?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiTag',
      },
      {
        id: "cat_6",
        name: 'Custom Packaging',
        sub: 'Custom mailer boxes, pouches & packaging',
        img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiBox',
      },
      {
        id: "cat_7",
        name: 'Stationery',
        sub: 'Branded letterheads, envelopes & notebooks',
        img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiFileText',
      },
      {
        id: "cat_8",
        name: 'Photo Printing',
        sub: 'High quality prints & canvas frames',
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
        iconName: 'FiImage',
      },
    ]
  }
};

export const DEFAULT_CATALOG_OPTIONS = {
  paperStock: [
    { name: '350 GSM Matte Art Card', priceModifier: 0 },
    { name: '400 GSM Velvet Soft-Touch Card', priceModifier: 1.5 },
    { name: '300 GSM Recycled Kraft Board', priceModifier: 0.8 },
    { name: '450 GSM Ultra-Heavy Cotton Card', priceModifier: 2.5 },
    { name: '250 GSM Glossy Coated Paper', priceModifier: -0.5 },
    { name: 'Translucent Frosted Poly Plastic', priceModifier: 3.0 },
    { name: 'Waterproof Synthetic Plastic Sheet', priceModifier: 2.2 }
  ],
  finishes: [
    { name: 'Matte Lamination', priceModifier: 0 },
    { name: 'Gloss Lamination', priceModifier: 0.5 },
    { name: 'Velvet Soft-Touch Lamination', priceModifier: 1.2 },
    { name: 'Raised 3D Gold Foil Stamping', priceModifier: 2.5 },
    { name: 'Metallic Silver Hot Stamping', priceModifier: 2.2 },
    { name: 'Rose Gold Foil Finish', priceModifier: 2.8 },
    { name: 'Holographic Rainbow Laser Foil', priceModifier: 3.5 },
    { name: 'Selective Gloss Spot UV', priceModifier: 1.5 },
    { name: '3D Embossed Raised UV Texture', priceModifier: 2.8 },
    { name: 'Blind Letterpress Embossing', priceModifier: 3.0 },
    { name: 'Custom Contour Die-Cutting', priceModifier: 2.0 }
  ],
  sides: [
    { name: 'Single-sided Print (1/0 CMYK)', priceModifier: 0 },
    { name: 'Double-sided Print (4/4 CMYK)', priceModifier: 1.5 },
    { name: 'Double-sided (4/4 + Metallic Spot)', priceModifier: 2.5 }
  ],
  corners: [
    { name: 'Standard Square Corners', priceModifier: 0 },
    { name: '3mm Rounded Corners (4 Edges)', priceModifier: 0.5 },
    { name: '6mm Rounded Corners (4 Edges)', priceModifier: 0.8 },
    { name: 'Beveled Edge Cutting', priceModifier: 1.2 },
    { name: 'Custom Die-Cut Shape', priceModifier: 2.5 }
  ],
  lamination: [
    { name: 'No Lamination Coating', priceModifier: 0 },
    { name: 'Thermal Gloss Lamination', priceModifier: 0.5 },
    { name: 'Scratch-Resistant Matte Lamination', priceModifier: 0.8 },
    { name: 'Velvet Soft-Touch Lamination', priceModifier: 1.5 },
    { name: 'Anti-Bacterial Protective Film', priceModifier: 2.0 }
  ],
  sizeFormat: [
    { name: 'Standard Business Card (90x55mm)', priceModifier: 0 },
    { name: 'US Standard Card (89x51mm)', priceModifier: 0 },
    { name: 'Square Mini Card (60x60mm)', priceModifier: 0.3 },
    { name: 'Slim Euro Format (90x45mm)', priceModifier: 0.3 },
    { name: 'Foldable 4-Panel Tent Card (90x110mm)', priceModifier: 1.8 },
    { name: 'Custom Bespoke Cut Size', priceModifier: 2.5 }
  ],
  foilAccents: [
    { name: 'No Metallic Foil Accent', priceModifier: 0 },
    { name: 'Raised 3D Gold Foil Accent', priceModifier: 2.2 },
    { name: 'Raised 3D Silver Foil Accent', priceModifier: 2.0 },
    { name: 'Rose Gold Luxury Metallic Foil', priceModifier: 2.5 },
    { name: 'Holographic Laser Diffraction Foil', priceModifier: 3.0 },
    { name: 'Copper Bronze Metallic Foil', priceModifier: 2.2 },
    { name: 'Emerald Green Metallic Foil', priceModifier: 2.5 }
  ],
  spotUV: [
    { name: 'No Spot UV Gloss', priceModifier: 0 },
    { name: 'Single-Sided Spot UV Logo Accent', priceModifier: 1.2 },
    { name: 'Double-Sided Spot UV Pattern', priceModifier: 2.0 },
    { name: '3D High-Build Embossed UV Glass', priceModifier: 2.8 }
  ],
  bindingStyle: [
    { name: 'No Binding (Loose Sheets)', priceModifier: 0 },
    { name: 'Saddle-Stitch Wire Staple', priceModifier: 1.0 },
    { name: 'Perfect Glue Book Binding', priceModifier: 2.5 },
    { name: 'Spiral Twin-Loop Wire-O', priceModifier: 2.0 },
    { name: 'Hardcover Case Bound', priceModifier: 5.0 }
  ],
  proofService: [
    { name: 'Print-Ready Artwork (Self Upload)', priceModifier: 0 },
    { name: 'Prepress CMYK Digital Soft Proof (+₹99)', priceModifier: 0.5 },
    { name: 'Full Graphic Designer Support (+₹299)', priceModifier: 1.5 },
    { name: 'Physical Printed Hardcopy Sample Proof (+₹499)', priceModifier: 3.0 }
  ],
  packagingStyle: [
    { name: 'Standard Eco Bulk Shrink Wrap', priceModifier: 0 },
    { name: 'Acrylic Clear Desk Presentation Box', priceModifier: 1.2 },
    { name: 'Luxury Rigid Gift Packaging Box', priceModifier: 3.5 },
    { name: 'Custom Branded Sleeve Outer Packaging', priceModifier: 2.0 }
  ],
  customAreaPricing: [


  ]
};

// ── Firestore Subscriptions for Homepage Settings & Catalog Options ──
const HOMEPAGE_SETTINGS_KEY = 'printigly_homepage_settings';
const CATALOG_OPTIONS_KEY = 'printigly_catalog_options';

export const subscribeToHomepageSettings = (onUpdate) => {
  const getLocal = () => {
    try {
      const stored = localStorage.getItem(HOMEPAGE_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_HOMEPAGE_SETTINGS;
    } catch (e) {
      return DEFAULT_HOMEPAGE_SETTINGS;
    }
  };

  // Immediate synchronous emit from local storage cache
  onUpdate(getLocal());

  try {
    const docRef = doc(db, 'site_settings', 'homepage');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        try {
          localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(firestoreData));
        } catch (e) { }
        onUpdate(firestoreData);
      } else {
        onUpdate(getLocal());
      }
    }, (err) => {
      console.warn("Homepage settings listener note:", err.message);
      onUpdate(getLocal());
    });
  } catch (err) {
    onUpdate(getLocal());
    return () => { };
  }
};

export const subscribeToHomepageCategories = (onUpdate) => {
  try {
    const q = query(collection(db, 'homepage_categories'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(data);
    }, () => onUpdate([]));
  } catch (err) {
    onUpdate([]);
    return () => { };
  }
};

export const saveHomepageCategory = async (data) => {
  try {
    const id = data.id || Date.now().toString();
    await setDoc(doc(db, 'homepage_categories', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteHomepageCategory = async (id) => {
  try {
    await deleteDoc(doc(db, 'homepage_categories', id));
    return true;
  } catch (err) {
    return false;
  }
};

export const subscribeToHomepageStats = (onUpdate) => {
  try {
    const q = query(collection(db, 'homepage_stats'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(data);
    }, () => onUpdate([]));
  } catch (err) {
    onUpdate([]);
    return () => { };
  }
};

export const saveHomepageStat = async (data) => {
  try {
    const id = data.id || Date.now().toString();
    await setDoc(doc(db, 'homepage_stats', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteHomepageStat = async (id) => {
  try {
    await deleteDoc(doc(db, 'homepage_stats', id));
    return true;
  } catch (err) {
    return false;
  }
};

export const subscribeToHomepageTestimonials = (onUpdate) => {
  try {
    const q = query(collection(db, 'homepage_testimonials'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(data);
    }, () => onUpdate([]));
  } catch (err) {
    onUpdate([]);
    return () => { };
  }
};

export const saveHomepageTestimonial = async (data) => {
  try {
    const id = data.id || Date.now().toString();
    await setDoc(doc(db, 'homepage_testimonials', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteHomepageTestimonial = async (id) => {
  try {
    await deleteDoc(doc(db, 'homepage_testimonials', id));
    return true;
  } catch (err) {
    return false;
  }
};

export const subscribeToHomepageBlogs = (onUpdate) => {
  try {
    const q = query(collection(db, 'homepage_blogs'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      onUpdate(data);
    }, () => onUpdate([]));
  } catch (err) {
    onUpdate([]);
    return () => { };
  }
};

export const saveHomepageBlog = async (data) => {
  try {
    const id = data.id || Date.now().toString();
    await setDoc(doc(db, 'homepage_blogs', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteHomepageBlog = async (id) => {
  try {
    await deleteDoc(doc(db, 'homepage_blogs', id));
    return true;
  } catch (err) {
    return false;
  }
};

export const saveHomepageSettingsToFirestore = async (settingsData) => {
  try {
    localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(settingsData));
    window.dispatchEvent(new Event('homepage_settings_updated'));
  } catch (e) { }

  try {
    const docRef = doc(db, 'site_settings', 'homepage');
    await setDoc(docRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Saving homepage settings note:", err.message);
    return false;
  }
};

export const subscribeToCatalogOptions = (onUpdate) => {
  const getLocal = () => {
    try {
      const stored = localStorage.getItem(CATALOG_OPTIONS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CATALOG_OPTIONS;
    } catch (e) {
      return DEFAULT_CATALOG_OPTIONS;
    }
  };

  onUpdate(getLocal());

  try {
    const docRef = doc(db, 'site_settings', 'catalog_options');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        try {
          localStorage.setItem(CATALOG_OPTIONS_KEY, JSON.stringify(firestoreData));
        } catch (e) { }
        onUpdate(firestoreData);
      } else {
        onUpdate(getLocal());
      }
    }, (err) => {
      console.warn("Catalog options listener note:", err.message);
      onUpdate(getLocal());
    });
  } catch (err) {
    onUpdate(getLocal());
    return () => { };
  }
};

export const saveCatalogOptionsToFirestore = async (optionsData) => {
  try {
    localStorage.setItem(CATALOG_OPTIONS_KEY, JSON.stringify(optionsData));
    window.dispatchEvent(new Event('catalog_options_updated'));
  } catch (e) { }

  try {
    const docRef = doc(db, 'site_settings', 'catalog_options');
    await setDoc(docRef, {
      ...optionsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Saving catalog options note:", err.message);
    return false;
  }
};

// ── Megamenu Categories & Subcategories Firestore Sync ──
export const DEFAULT_MEGAMENU_CATEGORIES = [
  {
    id: 'business-cards',
    title: 'Business Cards',
    badge: 'HOT',
    categoryQuery: 'Business Cards',
    iconName: 'FiCreditCard',
    items: [
      { name: 'Standard Cards', search: 'Standard Cards', tag: '350 GSM Matte/Gloss' },
      { name: 'Spot UV Cards', search: 'Spot UV Cards', tag: '3D Gloss Accent' },
      { name: 'Die Cut Cards', search: 'Die Cut Cards', tag: 'Custom Shapes' },
      { name: 'Metallic Foil Cards', search: 'Metallic Foil Cards', tag: 'Gold / Silver Foil' },
      { name: 'Soft-Touch Velvet Cards', search: 'Velvet Cards', tag: 'Silk Touch Premium' },
      { name: 'Luxury Thick Cards', search: 'Thick Cards', tag: '400+ GSM Triplex' },
    ]
  },
  {
    id: 'apparel',
    title: 'Apparel',
    badge: 'NEW',
    categoryQuery: 'Apparel',
    iconName: 'FiShoppingBag',
    items: [
      { name: 'T-Shirts', search: 'T-Shirts', tag: 'Round Neck Cotton' },
      { name: 'Polo T-Shirts', search: 'Polo T-Shirts', tag: 'Corporate Collared' },
      { name: 'Hoodies', search: 'Hoodies', tag: 'Winter Fleeced' },
      { name: 'Caps & Hats', search: 'Caps & Hats', tag: 'Embroidered Branding' },
      { name: 'Custom Sweatshirts', search: 'Sweatshirts', tag: 'Casual Premium' }
    ]
  },
  {
    id: 'gifts',
    title: 'Gifts',
    badge: 'POPULAR',
    categoryQuery: 'Gifts',
    iconName: 'FiGift',
    items: [
      { name: 'Mugs', search: 'Mugs', tag: 'Ceramic Magic Mugs' },
      { name: 'Keychains & Accessories', search: 'Keychains', tag: 'Metal & Acrylic' },
      { name: 'Frames & Lamps', search: 'Frames & Lamps', tag: 'LED Acrylic Light' },
      { name: 'Rakhi 2026', search: 'Rakhi 2026', tag: 'Festive Special' },
      { name: 'Photo Books', search: 'Photo Books', tag: 'Hardcover Albums' },
      { name: 'Personalised Gifts', search: 'Personalised Gifts', tag: 'Custom Keepsakes' }
    ]
  },
  {
    id: 'invitations',
    title: 'Invitations',
    badge: null,
    categoryQuery: 'Invitations',
    iconName: 'FiMail',
    items: [
      { name: 'Wedding Cards', search: 'Wedding Cards', tag: 'Traditional & Foil' },
      { name: 'Birthday Cards', search: 'Birthday Cards', tag: 'Vibrant & Themed' },
      { name: 'Thank You Cards', search: 'Thank You Cards', tag: 'Personalized Notes' },
      { name: 'Save the Date', search: 'Save the Date', tag: 'Announcements' },
      { name: 'Envelope & Seal Sets', search: 'Envelopes', tag: 'Custom Wax Seals' }
    ]
  },
  {
    id: 'corporate-gifting',
    title: 'Corporate Gifting',
    badge: 'TRENDING',
    categoryQuery: 'Corporate Gifting',
    iconName: 'FiBriefcase',
    items: [
      { name: 'ID Cards & Lanyards', search: 'ID Cards', tag: 'PVC Badges & Satin' },
      { name: 'Desk Calendars & Diaries', search: 'Calendars', tag: '365 Day Branding' },
      { name: 'Executive Box Kits', search: 'Gift Kits', tag: 'Corporate Sets' },
      { name: 'Rubber Stamps & Seals', search: 'Stamps', tag: 'Self-Inking Laser' },
      { name: 'Corporate Drinkware', search: 'Drinkware', tag: 'Stainless Bottles' }
    ]
  },
  {
    id: 'printing',
    title: 'Printing',
    badge: null,
    categoryQuery: 'Printing',
    iconName: 'FiPrinter',
    items: [
      { name: 'Brochures & Flyers', search: 'Brochures & Flyers', tag: 'Tri-fold & Pamphlets' },
      { name: 'Banners & Standees', search: 'Banners & Standees', tag: 'Flex & Roll-Up' },
      { name: 'Stickers & Labels', search: 'Stickers & Labels', tag: 'Waterproof Vinyl' },
      { name: 'Bill Books & NCR', search: 'Bill Books', tag: 'Carbonless Invoice' },
      { name: 'Letterheads & Stationery', search: 'Letterheads', tag: 'Executive Papers' },
      { name: 'Booklets & Catalogs', search: 'Booklets', tag: 'Saddle Stitch / Bound' },
      { name: 'Custom Packaging & Boxes', search: 'Packaging', tag: 'Product Cartons' }
    ]
  }
];

const MEGAMENU_CATEGORIES_KEY = 'printigly_megamenu_categories';

export const subscribeToMegamenuCategories = (onUpdate) => {
  const getLocal = () => {
    try {
      const stored = localStorage.getItem(MEGAMENU_CATEGORIES_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_MEGAMENU_CATEGORIES;
    } catch (e) {
      return DEFAULT_MEGAMENU_CATEGORIES;
    }
  };

  onUpdate(getLocal());

  try {
    const docRef = doc(db, 'site_settings', 'megamenu_categories');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data().categories || docSnap.data();
        const dataArr = Array.isArray(firestoreData) ? firestoreData : DEFAULT_MEGAMENU_CATEGORIES;
        try {
          localStorage.setItem(MEGAMENU_CATEGORIES_KEY, JSON.stringify(dataArr));
        } catch (e) { }
        onUpdate(dataArr);
      } else {
        onUpdate(getLocal());
      }
    }, (err) => {
      console.warn("Megamenu categories listener note:", err.message);
      onUpdate(getLocal());
    });
  } catch (err) {
    onUpdate(getLocal());
    return () => { };
  }
};

export const saveMegamenuCategoriesToFirestore = async (categoriesData) => {
  try {
    localStorage.setItem(MEGAMENU_CATEGORIES_KEY, JSON.stringify(categoriesData));
    window.dispatchEvent(new Event('megamenu_categories_updated'));
  } catch (e) { }

  try {
    const docRef = doc(db, 'site_settings', 'megamenu_categories');
    await setDoc(docRef, {
      categories: categoriesData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Saving megamenu categories note:", err.message);
    return false;
  }
};


