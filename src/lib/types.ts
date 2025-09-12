export type BlockType = 
  | 'text' 
  | 'heading-1' 
  | 'heading-2' 
  | 'heading-3' 
  | 'bulleted-list' 
  | 'numbered-list' 
  | 'code' 
  | 'quote' 
  | 'image';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    level?: number; // For headings
    language?: string; // For code blocks
    url?: string; // For images
    alt?: string; // For images
    listItems?: string[]; // For lists
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  title: string;
  blocks: ContentBlock[];
  parentId?: string;
  children?: string[];
  emoji?: string;
  cover?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: string;
}

export interface Workspace {
  id: string;
  name: string;
  pages: Record<string, Page>;
  rootPageIds: string[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  blockId: string;
  blockType: BlockType;
  content: string;
  context: string;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
}

export interface EditingState {
  activePageId: string | null;
  activeBlockId: string | null;
  isEditing: boolean;
  selection: {
    start: number;
    end: number;
  } | null;
}

export interface HistoryEntry {
  id: string;
  pageId: string;
  action: 'create' | 'update' | 'delete';
  blockId?: string;
  previousState: any;
  newState: any;
  timestamp: Date;
}