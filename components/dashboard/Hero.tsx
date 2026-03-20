'use client'

import { SignInButton, useUser } from '@clerk/nextjs'

const HeroSection = () => {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <section className="py-20 flex items-center justify-center">
      <div className="text-center px-6 max-w-2xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Chat Smarter,
          <span className="block bg-linear-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
            Think Deeper
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-base mb-8">
          A real-time AI chat experience that understands context and helps you think better — instantly.
        </p>

        {/* Sign in button */}
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 rounded-md font-medium text-white bg-linear-to-r from-cyan-500 to-violet-500 hover:opacity-90 transition">
              Start Chatting →
            </button>
          </SignInButton>
        )}

      </div>
    </section>
  )
}

export default HeroSection