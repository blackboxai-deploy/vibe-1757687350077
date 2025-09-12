'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Page } from '@/lib/types';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const PageItem: React.FC<{
  page: Page;
  level: number;
  onSelectPage: (pageId: string) => void;
  activePage: string | null;
}> = ({ page, level, onSelectPage, activePage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { workspace, createPage, deletePage } = useWorkspaceStore();
  
  const hasChildren = page.children && page.children.length > 0;
  const isActive = activePage === page.id;

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    createPage('Untitled', page.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      deletePage(page.id);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`group flex items-center w-full px-2 py-1 text-sm rounded-md hover:bg-accent cursor-pointer ${
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelectPage(page.id)}
      >
        {hasChildren && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        )}
        
        <span className="mr-2 text-base">{page.emoji || '📄'}</span>
        <span className="flex-1 truncate">{page.title}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-xs"
            onClick={handleAddChild}
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-xs hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleDelete}
          >
            ×
          </Button>
        </div>
      </div>

      {hasChildren && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            {page.children?.map(childId => {
              const childPage = workspace?.pages[childId];
              return childPage ? (
                <PageItem
                  key={childId}
                  page={childPage}
                  level={level + 1}
                  onSelectPage={onSelectPage}
                  activePage={activePage}
                />
              ) : null;
            })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const { workspace, createPage, editingState, setActiveePage } = useWorkspaceStore();
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      const newPage = createPage(newPageTitle.trim());
      setActiveePage(newPage.id);
      setNewPageTitle('');
      setIsCreatingPage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePage();
    } else if (e.key === 'Escape') {
      setIsCreatingPage(false);
      setNewPageTitle('');
    }
  };

  if (!workspace) return null;

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-muted/10 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          ☰
        </Button>
        {workspace.rootPageIds.slice(0, 3).map(pageId => {
          const page = workspace.pages[pageId];
          return page ? (
            <Button
              key={page.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveePage(page.id)}
              className="mb-2 text-base"
              title={page.title}
            >
              {page.emoji || '📄'}
            </Button>
          ) : null;
        })}
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{workspace.name}</h2>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            ☰
          </Button>
        </div>
        
        {isCreatingPage ? (
          <Input
            placeholder="Page title..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => {
              if (!newPageTitle.trim()) {
                setIsCreatingPage(false);
              }
            }}
            autoFocus
            className="h-8"
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingPage(true)}
            className="w-full justify-start text-muted-foreground"
          >
            + New Page
          </Button>
        )}
      </div>

      {/* Pages List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {workspace.rootPageIds.map(pageId => {
            const page = workspace.pages[pageId];
            return page ? (
              <PageItem
                key={page.id}
                page={page}
                level={0}
                onSelectPage={setActiveePage}
                activePage={editingState.activePageId}
              />
            ) : null;
          })}
        </div>
      </ScrollArea>

      <Separator />
      
      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground">
          {Object.keys(workspace.pages).length} pages
        </div>
      </div>
    </div>
  );
};