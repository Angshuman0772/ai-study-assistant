import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for login and logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check whether a session already exists
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error.message);
      }

      setUser(data?.user ?? null);
      setLoading(false);
    }

    getUser();

    // Stop listening when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create a new account
  function signUp(email, password, fullName) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  }

  // Log in to an existing account
  function signIn(email, password) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  // Log out
  function signOut() {
    return supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication from any component
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
