'use client'
import { useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import React from 'react'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) throw new Error("not found NEXT_PUBLIC_CONVEX_URL ")

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
const ConvexClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

export default ConvexClientProvider
