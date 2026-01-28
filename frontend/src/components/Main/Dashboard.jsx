import React from 'react';
 // adjust path if needed

import { useSelector } from 'react-redux';
import { Link } from '@tanstack/react-router';
import { FloatingShapes } from '../utils/floating-shapers';
import Navbar from '../utils/Navbar';
import { WobbleCard } from '../studio/wobble-card';
import { useState, useEffect } from "react";
import Spinner from "../spinner";



const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);


  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-purple-500/30">
      <FloatingShapes />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-stone-400 mt-2">
            What would you like to do today?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Create Studio Card */}
          <Link to="/create" className="col-span-1 lg:col-span-2 min-h-[300px] group">
            <WobbleCard
              containerClassName="w-full h-full bg-gradient-to-br from-indigo-900 via-stone-900 to-stone-900 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors"
            >
              <div className="max-w-xs relative z-10">
                <h2 className="text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  Create Your Studio
                </h2>
                <p className="mt-4 text-left text-base text-stone-300 group-hover:text-stone-100 transition-colors">
                  Record, edit, and publish your podcasts and videos with professional tools.
                </p>
              </div>
              <img
                src="/linear.webp"
                alt="Studio Preview" // Added accessible alt text
                className="absolute -right-4 lg:-right-[40%] grayscale group-hover:grayscale-0 filter -bottom-10 object-contain rounded-2xl opacity-50 group-hover:opacity-80 transition-all duration-500"
              />
            </WobbleCard>
          </Link>

          {/* Join Studio Card */}
          <Link to="/join" className="col-span-1 min-h-[300px] group">
            <WobbleCard
              containerClassName="w-full h-full bg-gradient-to-br from-purple-900 via-stone-900 to-stone-900 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors"
            >
              <h2 className="max-w-80 text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                Join a Session
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base text-stone-300 group-hover:text-stone-100 transition-colors">
                Enter a room ID to join an existing recording session.
              </p>
            </WobbleCard>
          </Link>

          {/* Content Library Card */}
          <Link to="/content" className="col-span-1 min-h-[300px] group">
            <WobbleCard
              containerClassName="w-full h-full bg-gradient-to-br from-blue-900 via-stone-900 to-stone-900 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors"
            >
              <h2 className="max-w-80 text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                Content Library
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base text-stone-300 group-hover:text-stone-100 transition-colors">
                Manage your recordings, downloads, and uploads.
              </p>
            </WobbleCard>
          </Link>

          {/* View Studios Card */}
          <Link to="/studios" className="col-span-1 lg:col-span-2 min-h-[300px] group">
            <WobbleCard
              containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-900 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors"
            >
              <div className="max-w-sm relative z-10">
                <h2 className="max-w-sm md:max-w-lg text-left text-balance text-2xl lg:text-3xl font-semibold tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                  My Studios
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-base text-stone-300 group-hover:text-stone-100 transition-colors">
                  View and manage all your created studio spaces.
                </p>
              </div>
              <img
                src="/linear.webp"
                alt="List Preview"
                className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-80 transition-all duration-500"
              />
            </WobbleCard>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

