import React from 'react';
import { TopAppBar } from './TopAppBar';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <TopAppBar />
      <div className="max-w-screen-2xl mx-auto flex">
        <SideNavBar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
};
