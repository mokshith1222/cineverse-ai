import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="rounded-xl bg-gray-900 border border-white/5 animate-pulse h-full w-full">
      <div className="h-0 pb-[150%] bg-gray-800" />
      <div className="p-3">
        <div className="h-3 bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-2 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}
