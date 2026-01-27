import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ThemeToggle } from '../ui/theme-toggle'
import { Link } from '@tanstack/react-router'
import { Button } from '../ui/button'
import UserAvatar from '../ui/UserAvatar'

const Navbar = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a brief moment for auth to initialize
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render auth buttons during initial load
  const showAuthButtons = !isLoading && !isAuthenticated;

  return (
    <header className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50 text-nowrap'>
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-8 py-3 flex items-center justify-between gap-8">
          <Link href="/" className="mr-10 md:mr-20 flex items-center">
  <h1 className="text-3xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
    FinalCast
  </h1>
</Link>

        <div className="hidden md:flex space-x-7">
            <Link
              href="#features"
              className="text-gray-300 font-semibold transition-all duration-300 hover:text-white cursor-pointer"

            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-gray-300 font-semibold transition-all duration-300 hover:text-white cursor-pointer"

            >
              Pricing
              
            </Link>
            <Link
              href="#contact"
              className="text-gray-300 font-semibold transition-all duration-300 hover:text-white cursor-pointer"

            >
              Contact
            </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex bg-blur items-center gap-3 ml-10 md:ml-20">
            <UserAvatar />
          </div>
        ) : showAuthButtons ? (
          <div className="flex items-center gap-3 ml-10 md:ml-20 cursor-pointer">
            <Link href='/auth'>
              <Button variant="glass">
                Sign In
              </Button>
            </Link>
            <Link href='/auth?mode=signup'>
              <Button variant="primary">
                Get Started
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-32 h-10"></div> // Placeholder to prevent layout shift
        )}
      </div>
    </header>
  )
}

export default Navbar
