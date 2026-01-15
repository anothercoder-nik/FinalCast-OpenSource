import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from '@tanstack/react-router'
import UserAvatar from '../components/ui/UserAvatar'
import StudioForm from '../components/Forms/studioForm.jsx'

const Studio = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <div className="h-screen w-screen overflow-hidden text-white fixed inset-0">
      {/* Minimal Header */}
      <header className='absolute top-6 left-6 right-6 z-50 flex justify-between items-center'>
        <Link href="/" className="flex items-center">
          <h1 className="text-3xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            FinalCast
          </h1>
        </Link>
        
        {isAuthenticated && (
          <div className="flex items-center">
            <UserAvatar />
          </div>
        )}
      </header>

      {/* Studio Form */}
      <StudioForm />
    </div>
  )
}

export default Studio

