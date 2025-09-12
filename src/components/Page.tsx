'use client';

import React from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { BlockEditor } from './BlockEditor';

interface PageProps {
  pageId?: string;
}

export const Page: React.FC<PageProps> = ({ pageId }) => {
  const { workspace, editingState } = useWorkspaceStore();
  
  // Use provided pageId or active page from state
  const activePageId = pageId || editingState.activePageId;
  
  if (!activePageId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to your workspace</h2>
          <p className="text-muted-foreground">
            Select a page from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  const page = workspace?.pages[activePageId];
  
  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <BlockEditor pageId={activePageId} />
    </div>
  );
};