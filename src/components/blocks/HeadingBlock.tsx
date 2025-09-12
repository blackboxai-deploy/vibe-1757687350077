'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { ContentBlock, BlockType } from '@/lib/types';

interface HeadingBlockProps {
  block: ContentBlock;
  pageId: string;
  onAddBlock?: (type: BlockType, index: number) => void;
  onDeleteBlock?: () => void;
  onMoveBlock?: (direction: 'up' | 'down') => void;
  isActive?: boolean;
  onFocus?: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
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
  const inputRef = useRef<HTMLInputElement>(null);

  const headingLevel = block.metadata?.level || 1;

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    if (isActive && editingState.isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, editingState.isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditingLocal(true);
      setEditing(true);
      onFocus?.();
      setTimeout(() => inputRef.current?.focus(), 0);
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
      onAddBlock?.('text', 1);
    } else if (e.key === 'Backspace' && content === '' && (e.currentTarget as HTMLInputElement).selectionStart === 0) {
      e.preventDefault();
      onDeleteBlock?.();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      onMoveBlock?.('up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      onMoveBlock?.('down');
    }
  };

  const getHeadingStyles = (level: number) => {
    switch (level) {
      case 1:
        return 'text-3xl font-bold text-foreground';
      case 2:
        return 'text-2xl font-semibold text-foreground';
      case 3:
        return 'text-xl font-medium text-foreground';
      default:
        return 'text-xl font-medium text-foreground';
    }
  };

  const getPlaceholder = (level: number) => {
    switch (level) {
      case 1:
        return 'Heading 1';
      case 2:
        return 'Heading 2';
      case 3:
        return 'Heading 3';
      default:
        return 'Heading';
    }
  };

  if (isEditing) {
    return (
      <div className={`group relative ${isActive ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder(headingLevel)}
          className={`w-full border-none outline-none bg-transparent placeholder:text-muted-foreground ${getHeadingStyles(headingLevel)}`}
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
      className={`group relative cursor-text hover:bg-accent/10 rounded px-2 py-2 -mx-2 ${
        isActive ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}
      onClick={handleClick}
    >
      {content ? (
        headingLevel === 1 ? (
          <h1 className={getHeadingStyles(headingLevel)}>{content}</h1>
        ) : headingLevel === 2 ? (
          <h2 className={getHeadingStyles(headingLevel)}>{content}</h2>
        ) : (
          <h3 className={getHeadingStyles(headingLevel)}>{content}</h3>
        )
      ) : (
        headingLevel === 1 ? (
          <h1 className={`${getHeadingStyles(headingLevel)} text-muted-foreground`}>
            {getPlaceholder(headingLevel)}
          </h1>
        ) : headingLevel === 2 ? (
          <h2 className={`${getHeadingStyles(headingLevel)} text-muted-foreground`}>
            {getPlaceholder(headingLevel)}
          </h2>
        ) : (
          <h3 className={`${getHeadingStyles(headingLevel)} text-muted-foreground`}>
            {getPlaceholder(headingLevel)}
          </h3>
        )
      )}
      <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 -ml-8 flex items-center">
        <div className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-accent rounded cursor-grab">
          ⋮⋮
        </div>
      </div>
    </div>
  );
};