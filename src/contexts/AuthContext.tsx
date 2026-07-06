import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  organization: string;
  role: string;
  bio: string;
  preferences: {
    defaultModel: string;
    theme: string;
    apiUsageLimit: number;
  };
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string, initialUser: FirebaseUser) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial default profile
        const defaultProfile: UserProfile = {
          uid,
          email: initialUser.email || "",
          displayName: initialUser.displayName || "AI Practitioner",
          photoURL: initialUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          organization: "PromptLabs SaaS",
          role: "Prompt Engineer",
          bio: "AI Researcher specialized in commercial prompting architectures and output evaluations.",
          preferences: {
            defaultModel: "gemini-3.5-flash",
            theme: "light",
            apiUsageLimit: 1000
          },
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(docRef, defaultProfile);
        } catch (writeErr: any) {
          if (writeErr?.code === "permission-denied" || writeErr?.message?.includes("permission") || writeErr?.message?.includes("Permission")) {
            handleFirestoreError(writeErr, OperationType.CREATE, `users/${uid}`);
          }
          throw writeErr;
        }
        setProfile(defaultProfile);
      }
    } catch (e: any) {
      if (e?.code === "permission-denied" || e?.message?.includes("permission") || e?.message?.includes("Permission")) {
        handleFirestoreError(e, OperationType.GET, `users/${uid}`);
      }
      console.error("Error setting/getting user profile:", e);
      // Fallback local memory profile in case Firestore permissions are still deploying or blocked
      setProfile({
        uid,
        email: initialUser.email || "",
        displayName: initialUser.displayName || "AI Practitioner",
        photoURL: initialUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
        organization: "PromptLabs SaaS",
        role: "Prompt Engineer",
        bio: "AI Researcher specialized in commercial prompting architectures and output evaluations.",
        preferences: {
          defaultModel: "gemini-3.5-flash",
          theme: "light",
          apiUsageLimit: 1000
        },
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await fetchUserProfile(currentUser.uid, currentUser);
        } catch (fetchErr) {
          console.error("AuthContext onAuthStateChanged: fetchUserProfile failed, continuing with fallback profile.", fetchErr);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Google sign in failure:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error("Sign out failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, data);
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (e: any) {
      if (e?.code === "permission-denied" || e?.message?.includes("permission") || e?.message?.includes("Permission")) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
      console.error("Failed to update profile on Firestore, falling back to local memory update:", e);
      // Fallback
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        logout,
        updateUserProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
