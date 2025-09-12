'use client';

import React, { useState, useCallback } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { ContentBlock, BlockType } from '@/lib/types';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { Button } from '@/components/ui/button';

interface BlockEditorProps {
  pageId: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ pageId }) => {
  const { 
    workspace, 
    createBlock, 
    updateBlock, 
    deleteBlock, 
    moveBlock,
    editingState,
    setActiveBlock 
  } = useWorkspaceStore();
  
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);

  const page = workspace?.pages[pageId];
  
  if (!page) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Page not found
      </div>
    );
  }

  const handleAddBlock = useCallback((type: BlockType, afterIndex: number) => {
    const newBlock = createBlock(pageId, type, '', afterIndex);
    setActiveBlockIndex(afterIndex);
    setActiveBlock(newBlock.id);
  }, [pageId, createBlock, setActiveBlock]);

  const handleDeleteBlock = useCallback((blockIndex: number) => {
    const block = page.blocks[blockIndex];
    if (block && page.blocks.length > 1) {
      deleteBlock(pageId, block.id);
      // Focus on the previous block or the next one
      const newActiveIndex = blockIndex > 0 ? blockIndex - 1 : blockIndex;
      setActiveBlockIndex(newActiveIndex);
      if (page.blocks[newActiveIndex]) {
        setActiveBlock(page.blocks[newActiveIndex].id);
      }
    }
  }, [page.blocks, pageId, deleteBlock, setActiveBlock]);

  const handleMoveBlock = useCallback((blockIndex: number, direction: 'up' | 'down') => {
    const block = page.blocks[blockIndex];
    if (!block) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex >= 0 && newIndex < page.blocks.length) {
      moveBlock(pageId, block.id, newIndex);
      setActiveBlockIndex(newIndex);
    }
  }, [page.blocks, pageId, moveBlock]);

  const handleBlockFocus = useCallback((blockId: string, index: number) => {
    setActiveBlock(blockId);
    setActiveBlockIndex(index);
  }, [setActiveBlock]);

  const renderBlock = (block: ContentBlock, index: number) => {
    const isActive = editingState.activeBlockId === block.id;
    
    const commonProps = {
      block,
      pageId,
      isActive,
      onAddBlock: (type: BlockType) => handleAddBlock(type, index + 1),
      onDeleteBlock: () => handleDeleteBlock(index),
      onMoveBlock: (direction: 'up' | 'down') => handleMoveBlock(index, direction),
      onFocus: () => handleBlockFocus(block.id, index),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock key={block.id} {...commonProps} />;
      case 'heading-1':
        return (
          <HeadingBlock 
            key={block.id} 
            {...commonProps} 
            block={{ ...block, metadata: { ...block.metadata, level: 1 } }}
          />
        );
      case 'heading-2':
        return (
          <HeadingBlock 
            key={block.id} 
            {...commonProps} 
            block={{ ...block, metadata: { ...block.metadata, level: 2 } }}
          />
        );
      case 'heading-3':
        return (
          <HeadingBlock 
            key={block.id} 
            {...commonProps} 
            block={{ ...block, metadata: { ...block.metadata, level: 3 } }}
          />
        );
      case 'bulleted-list':
        return (
          <div key={block.id} className="flex items-start gap-2 py-1">
            <span className="text-muted-foreground mt-2">•</span>
            <TextBlock {...commonProps} />
          </div>
        );
      case 'numbered-list':
        return (
          <div key={block.id} className="flex items-start gap-2 py-1">
            <span className="text-muted-foreground mt-2">{index + 1}.</span>
            <TextBlock {...commonProps} />
          </div>
        );
      case 'quote':
        return (
          <div key={block.id} className="border-l-4 border-muted pl-4 py-2">
            <TextBlock {...commonProps} />
          </div>
        );
      case 'code':
        return (
          <div key={block.id} className="bg-muted rounded-md p-4 font-mono text-sm">
            <TextBlock {...commonProps} />
          </div>
        );
      case 'image':
        return (
          <div key={block.id} className="my-4">
            {block.metadata?.url ? (
              <img 
                src={block.metadata.url} 
                alt={block.metadata?.alt || 'Image'}
                className="max-w-full h-auto rounded-md"
              />
            ) : (
              <div className="border-2 border-dashed border-muted rounded-md p-8 text-center text-muted-foreground">
                Click to add an image
              </div>
            )}
            <TextBlock {...commonProps} />
          </div>
        );
      default:
        return <TextBlock key={block.id} {...commonProps} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{page.emoji || '📄'}</span>
          <div className="flex-1">
            <input
              type="text"
              value={page.title}
              onChange={(e) => {
                updateBlock(pageId, page.id, { content: e.target.value });
              }}
              className="text-4xl font-bold bg-transparent border-none outline-none w-full placeholder:text-muted-foreground"
              placeholder="Untitled"
            />
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-2">
        {page.blocks.map((block, index) => renderBlock(block, index))}
      </div>

      {/* Add Block Button */}
      <div className="mt-8 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddBlock('text', page.blocks.length)}
          className="text-muted-foreground hover:text-foreground"
        >
          + Add a block
        </Button>
        
        {/* Block Type Shortcuts */}
        <div className="flex gap-1 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('heading-1', page.blocks.length)}
            className="h-6 px-2 text-xs"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('heading-2', page.blocks.length)}
            className="h-6 px-2 text-xs"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('bulleted-list', page.blocks.length)}
            className="h-6 px-2 text-xs"
          >
            •
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('numbered-list', page.blocks.length)}
            className="h-6 px-2 text-xs"
          >
            1.
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('quote', page.blocks.length)}
            className="h-6 px-2 text-xs"
          >
            "
          </Button>
        </div>
      </div>
    </div>
  );
};