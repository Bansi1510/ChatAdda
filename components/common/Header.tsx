"use client";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname()
  const dashboard = pathname.startsWith("/dashboard")
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
        >
          Chat-Adda
        </Link>

        <div className="flex items-center gap-3">
          <Authenticated>
            {!dashboard && (
              <Link href="/dashboard">
                <Button variant="outline" className="h-8 px-3 text-sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <UserButton />
          </Authenticated>

          <Unauthenticated>
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
            >
              <Button variant="outline" className="h-8 px-3 text-sm">
                Sign in
              </Button>
            </SignInButton>
          </Unauthenticated>
        </div>

      </div>
    </header>
  );
};

export default Header;
