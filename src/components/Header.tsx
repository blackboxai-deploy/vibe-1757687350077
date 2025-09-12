'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { workspace, editingState, setActiveePage, searchContent } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{pageId: string, blockId: string, content: string}>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentPage = editingState.activePageId 
    ? workspace?.pages[editingState.activePageId] 
    : null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchContent(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (pageId: string) => {
    setActiveePage(pageId);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getSearchPreview = (content: string, query: string) => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return content.slice(0, 100);
    
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + query.length + 20);
    
    const preview = content.slice(start, end);
    const highlightedPreview = preview.replace(
      new RegExp(`(${query})`, 'gi'), 
      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
    );
    
    return start > 0 ? '...' + highlightedPreview : highlightedPreview;
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {sidebarCollapsed && (
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            ☰
          </Button>
        )}
        
        {/* Page Title & Breadcrumb */}
        {currentPage && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPage.emoji || '📄'}</span>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{currentPage.title}</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Last edited {new Date(currentPage.updatedAt).toLocaleDateString()}</span>
                {currentPage.parentId && (
                  <>
                    <span>•</span>
                    <span>in {workspace?.pages[currentPage.parentId]?.title}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <div className="relative">
              <Input
                placeholder="Search pages..."
                className="w-full bg-muted/50"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ⌘K
              </div>
            </div>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Search Workspace</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Search pages and content..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {searchResults.map((result, index) => {
                      const page = workspace?.pages[result.pageId];
                      return (
                        <div
                          key={`${result.pageId}-${result.blockId}-${index}`}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => handleSearchResultClick(result.pageId)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span>{page?.emoji || '📄'}</span>
                            <span className="font-medium">{page?.title}</span>
                            {result.blockId && <Badge variant="secondary">Block</Badge>}
                          </div>
                          <div 
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ 
                              __html: getSearchPreview(result.content, searchQuery) 
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Page Actions */}
        {currentPage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Edit Properties
              </DropdownMenuItem>
              <DropdownMenuItem>
                Duplicate Page
              </DropdownMenuItem>
              <DropdownMenuItem>
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Workspace Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-sm flex items-center justify-center text-xs text-white font-bold">
                {workspace?.name.charAt(0).toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Workspace Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Import Data
            </DropdownMenuItem>
            <DropdownMenuItem>
              Export Workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Help & Support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};