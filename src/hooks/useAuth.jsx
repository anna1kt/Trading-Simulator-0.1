import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'


const AuthContext = createContext({ user: null, ready: false })


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setReady(true) })
    return () => unsub()
  }, [])


  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>
}


export function useAuth() { return useContext(AuthContext) }