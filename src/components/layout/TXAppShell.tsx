import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TXSidebar } from './TXSidebar';
import { TXHeader } from './TXHeader';

interface TXAppShellProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function TXAppShell({ children, currentPage, onPageChange }: TXAppShellProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <TXSidebar currentPage={currentPage} onPageChange={onPageChange} />
        
        <div className="flex-1 flex flex-col">
          <TXHeader />
          
          <main className="flex-1 p-6 tx-container">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}