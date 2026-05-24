import React from 'react';

/**
 * Standard shimmering element base
 */
export const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral-800 rounded ${className}`} />
);

/**
 * Card skeleton representing a 3D model thumbnail slot
 */
export const ModelCardSkeleton = () => (
  <div className="border border-neutral-800 bg-neutral-900/50 backdrop-blur rounded-xl p-4 flex flex-col gap-4">
    <Shimmer className="h-44 w-full rounded-lg" />
    <div className="flex justify-between items-center mt-2">
      <div className="flex flex-col gap-2 w-2/3">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <Shimmer className="h-8 w-12 rounded-lg" />
    </div>
  </div>
);

/**
 * Multi-card grid skeleton for loading states
 */
export const DashboardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <ModelCardSkeleton key={idx} />
    ))}
  </div>
);

/**
 * Detail page skeletons
 */
export const ModelViewerSkeleton = () => (
  <div className="w-full h-full flex flex-col gap-4 p-4 lg:p-6 bg-neutral-950">
    <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
      <div className="flex items-center gap-4 w-1/3">
        <Shimmer className="h-8 w-8 rounded-full" />
        <Shimmer className="h-6 w-full" />
      </div>
      <div className="flex gap-3">
        <Shimmer className="h-9 w-24 rounded-lg" />
        <Shimmer className="h-9 w-24 rounded-lg" />
      </div>
    </div>
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      <div className="flex-1 rounded-2xl relative overflow-hidden border border-neutral-800 bg-neutral-900/30">
        <Shimmer className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-sm text-neutral-400 font-medium">Initializing 3D Canvas...</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 flex flex-col gap-4 border border-neutral-800 bg-neutral-900/30 rounded-2xl p-5">
        <Shimmer className="h-6 w-1/2 mb-2" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-3/4" />
        <div className="h-px bg-neutral-800 my-2" />
        <Shimmer className="h-5 w-1/3 mb-2" />
        <div className="flex flex-col gap-2">
          <Shimmer className="h-8 w-full" />
          <Shimmer className="h-8 w-full" />
          <Shimmer className="h-8 w-full" />
        </div>
      </div>
    </div>
  </div>
);
