'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { ContentBlock, BlockType } from '@/lib/types';

interface TextBlockProps {
  block: ContentBlock;
  pageId: string;
  onAddBlock?: (type: BlockType, index: number) => void;
  onDeleteBlock?: () => void;
  onMoveBlock?: (direction: 'up' | 'down') => void;
  isActive?: boolean;
  onFocus?: () => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  pageId,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  isActive,
  onFocus,
}) => {
  const { updateBlock, editingState, setEditing } = useWorkspaceStore();
  const [isEditing, setIsEditingLocal] = useState(false);
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    if (isActive && editingState.isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, editingState.isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditingLocal(true);
      setEditing(true);
      onFocus?.();
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleBlur = () => {
    setIsEditingLocal(false);
    setEditing(false);
    if (content !== block.content) {
      updateBlock(pageId, block.id, { content });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() === '') {
        // Convert to different block type or add new block
        onAddBlock?.('text', 1);
      } else {
        onAddBlock?.('text', 1);
      }
    } else if (e.key === 'Backspace' && content === '' && (e.currentTarget as HTMLTextAreaElement).selectionStart === 0) {
      e.preventDefault();
      onDeleteBlock?.();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      onMoveBlock?.('up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      onMoveBlock?.('down');
    } else if (e.key === '/' && content === '') {
      // Trigger block type selection
      e.preventDefault();
      // This would open a block type selector in a real implementation
      console.log('Show block type selector');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Auto-resize on content change
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content, isEditing]);

  if (isEditing) {
    return (
      <div className={`group relative ${isActive ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type something, or type '/' for commands..."
          className="w-full resize-none border-none outline-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground"
          style={{ minHeight: '1.5rem' }}
        />
        <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 -ml-8 flex items-center">
          <div className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-accent rounded cursor-grab">
            ⋮⋮
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative cursor-text hover:bg-accent/10 rounded px-2 py-1 -mx-2 ${
        isActive ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}
      onClick={handleClick}
    >
      {content ? (
        <div className="text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="text-muted-foreground text-base leading-relaxed">
          Empty block. Click to edit or type '/' for commands.
        </div>
      )}
      <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 -ml-8 flex items-center">
        <div className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-accent rounded cursor-grab">
          ⋮⋮
        </div>
      </div>
    </div>
  );
};