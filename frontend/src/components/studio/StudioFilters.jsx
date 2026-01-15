import React from 'react';
import { Search, Filter, UserCircle } from 'lucide-react';

const StudioFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800 rounded-2xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-400 mb-2">
            <Search className="w-4 h-4" />
            Search Studios
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Filter by title..."
              className="w-full pl-4 pr-4 py-2.5 bg-stone-950 border border-stone-800 text-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-stone-600"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-400 mb-2">
            <Filter className="w-4 h-4" />
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-stone-950 border border-stone-800 text-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-400 mb-2">
            <UserCircle className="w-4 h-4" />
            Your Role
          </label>
          <div className="relative">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-stone-950 border border-stone-800 text-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="host">Host</option>
              <option value="participant">Participant</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioFilters;
