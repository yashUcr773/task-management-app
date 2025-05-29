"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from 'next-auth'
import { SessionProvider, useSession } from 'next-auth/react'

type AuthContextType = {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true
})

export function AuthProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode
  session: Session | null 
}) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  
  return (
    <AuthContext.Provider value={{
      session,
      loading: status === "loading"
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
