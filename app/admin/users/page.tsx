// app/admin/users/page.tsx
"use client";

import { Suspense } from 'react';
import { UsersPageProvider } from './providers/UsersPageProvider';
import { UsersPageSkeleton } from './components/UsersPageSkeleton';
import { UsersPageContent } from './components/UserPageContent';

export default function UsersManagementPage() {
  return (
    <UsersPageProvider>
      <Suspense fallback={<UsersPageSkeleton />}>
        <UsersPageContent />
      </Suspense>
    </UsersPageProvider>
  );
}
