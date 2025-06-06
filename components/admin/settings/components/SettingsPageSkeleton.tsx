// app/admin/settings/components/SettingsPageSkeleton.tsx
"use client";

import React from 'react';

export const SettingsPageSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Settings Header Skeleton */}
      <SettingsHeaderSkeleton />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Unsaved Changes Alert Skeleton */}
        <UnsavedChangesAlertSkeleton />
        
        {/* Status Bar Skeleton */}
        <SettingsStatusBarSkeleton />

        {/* Settings Tabs Skeleton */}
        <SettingsTabsSkeleton />
      </div>
    </div>
  );
});

// Settings Header Skeleton
const SettingsHeaderSkeleton = React.memo(() => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-64 animate-pulse"></div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-16 h-10 bg-red-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-blue-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Unsaved Changes Alert Skeleton
const UnsavedChangesAlertSkeleton = React.memo(() => {
  return (
    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-yellow-200 rounded"></div>
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-yellow-200 rounded w-48"></div>
          <div className="h-3 bg-yellow-100 rounded w-64"></div>
        </div>
        <div className="w-16 h-8 bg-yellow-200 rounded"></div>
      </div>
    </div>
  );
});

// Settings Status Bar Skeleton
const SettingsStatusBarSkeleton = React.memo(() => {
  return (
    <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-40 animate-pulse"></div>
        </div>

        {/* Right side - Import/Export buttons */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
});

// Settings Tabs Skeleton
const SettingsTabsSkeleton = React.memo(() => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200/50">
        <div className="flex space-x-8 px-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="py-4">
              <div className={`flex items-center gap-2 ${index === 0 ? 'border-b-2 border-blue-200' : ''}`}>
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className={`h-4 rounded animate-pulse ${
                  index === 0 ? 'w-16 bg-blue-200' : 'w-12 bg-gray-200'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <SettingsTabContentSkeleton />
      </div>
    </div>
  );
});

// Settings Tab Content Skeleton
const SettingsTabContentSkeleton = React.memo(() => {
  return (
    <div className="space-y-8">
      {/* Section 1 */}
      <SettingsSectionSkeleton title="Основные настройки" />
      
      {/* Section 2 */}
      <SettingsSectionSkeleton title="Безопасность" />
      
      {/* Section 3 */}
      <SettingsSectionSkeleton title="Уведомления" />
    </div>
  );
});

// Individual Settings Section Skeleton
const SettingsSectionSkeleton = React.memo(({ title }: { title: string }) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-64 animate-pulse"></div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SettingsItemSkeleton key={index} type={index % 3} />
        ))}
      </div>
    </div>
  );
});

// Individual Settings Item Skeleton
const SettingsItemSkeleton = React.memo(({ type }: { type: number }) => {
  return (
    <div className="bg-gray-50/50 rounded-lg p-4 space-y-3 animate-pulse">
      {/* Label and description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-100 rounded w-48"></div>
      </div>

      {/* Input based on type */}
      {type === 0 && (
        // Text input
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      )}
      
      {type === 1 && (
        // Toggle switch
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        </div>
      )}
      
      {type === 2 && (
        // Select dropdown
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      )}
    </div>
  );
});

// Alternative: Compact Settings Skeleton
export const CompactSettingsPageSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
            <div className="w-20 h-8 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`h-10 rounded-lg animate-pulse flex-shrink-0 ${
              index === 0 ? 'w-20 bg-blue-200' : 'w-16 bg-gray-200'
            }`}></div>
          ))}
        </div>

        {/* Settings Items */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Loading State for specific operations
export const SettingsOperationSkeleton = React.memo(({ operation }: { operation: string }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-pulse">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded w-48 mx-auto"></div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-200 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Display names
SettingsHeaderSkeleton.displayName = 'SettingsHeaderSkeleton';
UnsavedChangesAlertSkeleton.displayName = 'UnsavedChangesAlertSkeleton';
SettingsStatusBarSkeleton.displayName = 'SettingsStatusBarSkeleton';
SettingsTabsSkeleton.displayName = 'SettingsTabsSkeleton';
SettingsTabContentSkeleton.displayName = 'SettingsTabContentSkeleton';
SettingsSectionSkeleton.displayName = 'SettingsSectionSkeleton';
SettingsItemSkeleton.displayName = 'SettingsItemSkeleton';
SettingsPageSkeleton.displayName = 'SettingsPageSkeleton';
CompactSettingsPageSkeleton.displayName = 'CompactSettingsPageSkeleton';
SettingsOperationSkeleton.displayName = 'SettingsOperationSkeleton';

// Exports
export {
  SettingsHeaderSkeleton,
  UnsavedChangesAlertSkeleton,
  SettingsStatusBarSkeleton,
  SettingsTabsSkeleton,
  SettingsTabContentSkeleton,
  SettingsSectionSkeleton,
  SettingsItemSkeleton,
};
