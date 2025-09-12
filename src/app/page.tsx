'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Page } from '@/components/Page';

export default function WorkspacePage() {
  const { workspace, initializeWorkspace } = useWorkspaceStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize workspace on first load
  useEffect(() => {
    if (!workspace) {
      initializeWorkspace();
    }
  }, [workspace, initializeWorkspace]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header 
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        
        {/* Page Content */}
        <Page />
      </div>
    </div>
  );
}