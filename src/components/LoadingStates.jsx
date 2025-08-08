import React from 'react';

export const AppLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export const ConnectionStatus = () => (
  <div className="fixed top-4 right-4 z-50">
    {/* Connection status indicator */}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

export const ProjectsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-24 bg-gray-200 rounded"></div>
    ))}
  </div>
);

export const ResearchToolsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

export const CommunitySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/5"></div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 rounded"></div>
    ))}
  </div>
);

export const AccessCodesSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-12 bg-gray-200 rounded w-full"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 rounded"></div>
    ))}
  </div>
);

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  children,
}) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )}
  </div>
);
