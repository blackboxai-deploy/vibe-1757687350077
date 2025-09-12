'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Workspace, 
  Page, 
  ContentBlock, 
  WorkspaceSettings, 
  EditingState,
  BlockType 
} from './types';

interface WorkspaceStore {
  // Workspace state
  workspace: Workspace | null;
  editingState: EditingState;
  
  // Actions
  initializeWorkspace: (name?: string) => void;
  createPage: (title: string, parentId?: string, emoji?: string) => Page;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  
  // Block actions
  createBlock: (pageId: string, type: BlockType, content?: string, index?: number) => ContentBlock;
  updateBlock: (pageId: string, blockId: string, updates: Partial<ContentBlock>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, newIndex: number) => void;
  
  // Editing actions
  setActiveePage: (pageId: string | null) => void;
  setActiveBlock: (blockId: string | null) => void;
  setEditing: (isEditing: boolean) => void;
  
  // Settings
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
  
  // Utility
  getPage: (pageId: string) => Page | undefined;
  getBlock: (pageId: string, blockId: string) => ContentBlock | undefined;
  searchContent: (query: string) => Array<{pageId: string, blockId: string, content: string}>;
}

const defaultSettings: WorkspaceSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  fontSize: 'medium',
  showLineNumbers: true,
  autoSave: true,
  autoSaveInterval: 2000,
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      workspace: null,
      editingState: {
        activePageId: null,
        activeBlockId: null,
        isEditing: false,
        selection: null,
      },

      initializeWorkspace: (name = 'My Workspace') => {
        const now = new Date();
        const welcomePageId = `page-${Date.now()}`;
        const welcomeBlockId = `block-${Date.now()}`;
        
        const welcomePage: Page = {
          id: welcomePageId,
          title: 'Welcome to your workspace',
          blocks: [
            {
              id: welcomeBlockId,
              type: 'text',
              content: 'Welcome to your new workspace! Start by creating your first page or editing this one.',
              createdAt: now,
              updatedAt: now,
            }
          ],
          emoji: '👋',
          isPublic: false,
          createdAt: now,
          updatedAt: now,
        };

        const workspace: Workspace = {
          id: `workspace-${Date.now()}`,
          name,
          pages: {
            [welcomePageId]: welcomePage,
          },
          rootPageIds: [welcomePageId],
          settings: defaultSettings,
          createdAt: now,
          updatedAt: now,
        };

        set({ workspace });
      },

      createPage: (title, parentId, emoji) => {
        const state = get();
        if (!state.workspace) return {} as Page;

        const now = new Date();
        const pageId = `page-${Date.now()}`;
        const blockId = `block-${Date.now()}`;
        
        const newPage: Page = {
          id: pageId,
          title,
          blocks: [
            {
              id: blockId,
              type: 'text',
              content: '',
              createdAt: now,
              updatedAt: now,
            }
          ],
          parentId,
          emoji,
          isPublic: false,
          createdAt: now,
          updatedAt: now,
        };

        const updatedWorkspace = { ...state.workspace };
        updatedWorkspace.pages[pageId] = newPage;
        
        if (parentId) {
          const parentPage = updatedWorkspace.pages[parentId];
          if (parentPage) {
            parentPage.children = parentPage.children || [];
            parentPage.children.push(pageId);
          }
        } else {
          updatedWorkspace.rootPageIds.push(pageId);
        }

        updatedWorkspace.updatedAt = now;

        set({ workspace: updatedWorkspace });
        return newPage;
      },

      updatePage: (pageId, updates) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          updatedWorkspace.pages[pageId] = {
            ...page,
            ...updates,
            updatedAt: new Date(),
          };
          updatedWorkspace.updatedAt = new Date();
          set({ workspace: updatedWorkspace });
        }
      },

      deletePage: (pageId) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          // Remove from parent or root
          if (page.parentId) {
            const parent = updatedWorkspace.pages[page.parentId];
            if (parent && parent.children) {
              parent.children = parent.children.filter(id => id !== pageId);
            }
          } else {
            updatedWorkspace.rootPageIds = updatedWorkspace.rootPageIds.filter(id => id !== pageId);
          }
          
          // Recursively delete children
          const deletePageAndChildren = (id: string) => {
            const pageToDelete = updatedWorkspace.pages[id];
            if (pageToDelete && pageToDelete.children) {
              pageToDelete.children.forEach(childId => deletePageAndChildren(childId));
            }
            delete updatedWorkspace.pages[id];
          };
          
          deletePageAndChildren(pageId);
          updatedWorkspace.updatedAt = new Date();
          set({ workspace: updatedWorkspace });
        }
      },

      createBlock: (pageId, type, content = '', index) => {
        const state = get();
        if (!state.workspace) return {} as ContentBlock;

        const now = new Date();
        const blockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newBlock: ContentBlock = {
          id: blockId,
          type,
          content,
          createdAt: now,
          updatedAt: now,
        };

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          if (typeof index === 'number') {
            page.blocks.splice(index, 0, newBlock);
          } else {
            page.blocks.push(newBlock);
          }
          page.updatedAt = now;
          updatedWorkspace.updatedAt = now;
          set({ workspace: updatedWorkspace });
        }

        return newBlock;
      },

      updateBlock: (pageId, blockId, updates) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          const blockIndex = page.blocks.findIndex(block => block.id === blockId);
          if (blockIndex !== -1) {
            page.blocks[blockIndex] = {
              ...page.blocks[blockIndex],
              ...updates,
              updatedAt: new Date(),
            };
            page.updatedAt = new Date();
            updatedWorkspace.updatedAt = new Date();
            set({ workspace: updatedWorkspace });
          }
        }
      },

      deleteBlock: (pageId, blockId) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          page.blocks = page.blocks.filter(block => block.id !== blockId);
          page.updatedAt = new Date();
          updatedWorkspace.updatedAt = new Date();
          set({ workspace: updatedWorkspace });
        }
      },

      moveBlock: (pageId, blockId, newIndex) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        const page = updatedWorkspace.pages[pageId];
        
        if (page) {
          const blockIndex = page.blocks.findIndex(block => block.id === blockId);
          if (blockIndex !== -1) {
            const [movedBlock] = page.blocks.splice(blockIndex, 1);
            page.blocks.splice(newIndex, 0, movedBlock);
            page.updatedAt = new Date();
            updatedWorkspace.updatedAt = new Date();
            set({ workspace: updatedWorkspace });
          }
        }
      },

      setActiveePage: (pageId) => {
        set(state => ({
          editingState: { ...state.editingState, activePageId: pageId }
        }));
      },

      setActiveBlock: (blockId) => {
        set(state => ({
          editingState: { ...state.editingState, activeBlockId: blockId }
        }));
      },

      setEditing: (isEditing) => {
        set(state => ({
          editingState: { ...state.editingState, isEditing }
        }));
      },

      updateSettings: (settings) => {
        const state = get();
        if (!state.workspace) return;

        const updatedWorkspace = { ...state.workspace };
        updatedWorkspace.settings = { ...updatedWorkspace.settings, ...settings };
        updatedWorkspace.updatedAt = new Date();
        set({ workspace: updatedWorkspace });
      },

      getPage: (pageId) => {
        const state = get();
        return state.workspace?.pages[pageId];
      },

      getBlock: (pageId, blockId) => {
        const state = get();
        const page = state.workspace?.pages[pageId];
        return page?.blocks.find(block => block.id === blockId);
      },

      searchContent: (query) => {
        const state = get();
        if (!state.workspace || !query.trim()) return [];

        const results: Array<{pageId: string, blockId: string, content: string}> = [];
        const lowerQuery = query.toLowerCase();

        Object.values(state.workspace.pages).forEach((page: Page) => {
          // Search in page title
          if (page.title.toLowerCase().includes(lowerQuery)) {
            results.push({
              pageId: page.id,
              blockId: '',
              content: page.title,
            });
          }

          // Search in blocks
          page.blocks.forEach(block => {
            if (block.content.toLowerCase().includes(lowerQuery)) {
              results.push({
                pageId: page.id,
                blockId: block.id,
                content: block.content,
              });
            }
          });
        });

        return results;
      },
    }),
    {
      name: 'notion-workspace',
      partialize: (state) => ({ workspace: state.workspace }),
    }
  )
);