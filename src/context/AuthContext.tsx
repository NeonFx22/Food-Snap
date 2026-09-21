import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc,
  User, 
  UserProfileData, 
  OperationType, 
  handleFirestoreError 
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  isAuthReady: boolean;
  authError: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string, preferences?: string[]) => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfileData>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = () => setAuthError(null);

  // Sync or fetch user profile from Firestore
  const fetchOrCreateProfile = async (firebaseUser: User, extraName?: string, preferences?: string[]) => {
    const userDocPath = `users/${firebaseUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfileData;
        setUserProfile(data);
        return data;
      } else {
        // Create new user profile document
        const newProfile: UserProfileData = {
          uid: firebaseUser.uid,
          displayName: extraName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Culinary Explorer',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          dietaryPreferences: preferences || ['All Cuisines', 'West African Flavor']
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Profile sync notice:', err);
      // Fallback local profile in case of permissions or offline
      const fallbackProfile: UserProfileData = {
        uid: firebaseUser.uid,
        displayName: extraName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Culinary Explorer',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        dietaryPreferences: preferences || ['All Cuisines']
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    // Check if there is an existing custom password account session stored locally
    const restoreCustomSession = async () => {
      try {
        const savedToken = localStorage.getItem('foodsnap_custom_token');
        const savedUserJson = localStorage.getItem('foodsnap_custom_user');
        if (savedToken && savedUserJson) {
          const parsedUser = JSON.parse(savedUserJson) as UserProfileData;
          setUser({
            uid: parsedUser.uid,
            email: parsedUser.email,
            displayName: parsedUser.displayName,
            photoURL: parsedUser.photoURL || null
          } as any);
          setUserProfile(parsedUser);

          // Verify token in background
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success && res.user) {
                setUserProfile(res.user);
                localStorage.setItem('foodsnap_custom_user', JSON.stringify(res.user));
              }
            })
            .catch((e) => console.warn('Session verification notice:', e));
        }
      } catch (e) {
        console.warn('Restore custom session error:', e);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchOrCreateProfile(currentUser);
      } else {
        const hasCustomUser = localStorage.getItem('foodsnap_custom_user');
        if (!hasCustomUser) {
          setUser(null);
          setUserProfile(null);
        }
      }
      setIsLoading(false);
      setIsAuthReady(true);
    });

    restoreCustomSession();
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      // Clear any custom password session before Google sign-in
      localStorage.removeItem('foodsnap_custom_user');
      localStorage.removeItem('foodsnap_custom_token');
      const result = await signInWithPopup(auth, googleProvider);
      await fetchOrCreateProfile(result.user);
    } catch (err: any) {
      console.error('Google login error:', err);
      let message = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-blocked') {
        message = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign in was cancelled.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    setIsLoading(true);
    const cleanEmail = email.trim();

    try {
      // 1. Attempt standard Firebase Auth sign-in
      try {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
        localStorage.removeItem('foodsnap_custom_user');
        localStorage.removeItem('foodsnap_custom_token');
        await fetchOrCreateProfile(result.user);
        return;
      } catch (firebaseErr: any) {
        const code = firebaseErr?.code || '';
        // If operation not allowed, user not found, or invalid credential, try dedicated password account API
        if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/admin-restricted-operation' ||
          code === 'auth/user-not-found' ||
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          firebaseErr?.message?.includes('OPERATION_NOT_ALLOWED')
        ) {
          // Fall through to server API
        } else {
          throw firebaseErr;
        }
      }

      // 2. Query server password authentication endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Incorrect email or password. Please verify your credentials.');
      }

      const customUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: data.user.photoURL || null
      } as any;

      localStorage.setItem('foodsnap_custom_user', JSON.stringify(data.user));
      localStorage.setItem('foodsnap_custom_token', data.token);

      setUser(customUser);
      setUserProfile(data.user);
    } catch (err: any) {
      console.error('Email signin error:', err);
      let message = err.message || 'Invalid email or password.';
      if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again in a few minutes.';
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string, preferences?: string[]) => {
    setAuthError(null);
    setIsLoading(true);
    const cleanEmail = email.trim();
    const cleanName = name.trim() || 'Culinary Foodie';

    try {
      // 1. Attempt standard Firebase Auth account creation
      try {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (cleanName) {
          await updateProfile(result.user, { displayName: cleanName });
        }
        localStorage.removeItem('foodsnap_custom_user');
        localStorage.removeItem('foodsnap_custom_token');
        await fetchOrCreateProfile(result.user, cleanName, preferences);
        return;
      } catch (firebaseErr: any) {
        const code = firebaseErr?.code || '';
        // If Firebase Auth does not have email/password enabled, seamlessly fall back to server account API
        if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/admin-restricted-operation' ||
          firebaseErr?.message?.includes('OPERATION_NOT_ALLOWED')
        ) {
          // Fall through to dedicated server API
        } else {
          throw firebaseErr;
        }
      }

      // 2. Query server password account creation endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          preferences: preferences || ['West African Tradition', 'All Cuisines']
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account. Please check your details.');
      }

      const customUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: data.user.photoURL || null
      } as any;

      localStorage.setItem('foodsnap_custom_user', JSON.stringify(data.user));
      localStorage.setItem('foodsnap_custom_token', data.token);

      setUser(customUser);
      setUserProfile(data.user);
    } catch (err: any) {
      console.error('Email signup error:', err);
      let message = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo user quick login
  const loginAsDemoUser = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const demoEmail = 'demo.chef@foodsnap.ai';
      const demoPass = 'FoodSnap2026!';

      // Use dedicated login endpoint
      await loginWithEmail(demoEmail, demoPass);
    } catch (err: any) {
      console.warn('Demo login notice:', err);
      const mockProfile: UserProfileData = {
        uid: 'demo_chef_amara',
        displayName: 'Chef Amara (Demo)',
        email: 'demo.chef@foodsnap.ai',
        createdAt: new Date().toISOString(),
        dietaryPreferences: ['West African Tradition', 'Spice Enthusiast', 'Healthy Grain']
      };
      setUser({
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.displayName,
        photoURL: null
      } as any);
      setUserProfile(mockProfile);
      localStorage.setItem('foodsnap_custom_user', JSON.stringify(mockProfile));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    const cleanEmail = email.trim();
    try {
      // Try Firebase password reset first
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return;
      } catch (firebaseErr: any) {
        const code = firebaseErr?.code || '';
        if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/admin-restricted-operation' ||
          code === 'auth/user-not-found' ||
          firebaseErr?.message?.includes('OPERATION_NOT_ALLOWED')
        ) {
          // Fall through to dedicated server API
        } else {
          throw firebaseErr;
        }
      }

      // Query server password reset endpoint
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process password reset request.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      let message = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const updateProfileDetails = async (updates: Partial<UserProfileData>) => {
    if (!user && !userProfile) return;
    setAuthError(null);
    try {
      const currentUid = user ? user.uid : userProfile?.uid;
      if (!currentUid) return;

      const updatedProfile: UserProfileData = {
        ...(userProfile || {
          uid: currentUid,
          displayName: 'User',
          email: user?.email || '',
          createdAt: new Date().toISOString()
        }),
        ...updates
      };

      // If user is a custom password account or server managed
      fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUid, updates })
      }).catch((e) => console.warn('Server profile update notice:', e));

      // If Firebase user is active, attempt Firestore sync
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUid);
          await setDoc(userDocRef, updatedProfile, { merge: true });
          if (updates.displayName && updates.displayName !== auth.currentUser.displayName) {
            await updateProfile(auth.currentUser, { displayName: updates.displayName });
          }
        } catch (fsErr) {
          console.warn('Firestore profile update notice:', fsErr);
        }
      }

      localStorage.setItem('foodsnap_custom_user', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('foodsnap_custom_user');
      localStorage.removeItem('foodsnap_custom_token');
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthReady,
        authError,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAsDemoUser,
        resetPassword,
        updateProfileDetails,
        logout
      }}
    >
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
