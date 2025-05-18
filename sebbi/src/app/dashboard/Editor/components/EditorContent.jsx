import React from 'react';
import { EditorContent as TiptapEditorContent, BubbleMenu } from "@tiptap/react";
import Toolbar from '../Toolbar';
import CommandMenu from '../CommandMenu';

export default function EditorContentWrapper({
    editor,
    menuState,
    commandMenuRef,
    handleCommandExecution,
    setMenuState
}) {
    return (
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-12">
            <TiptapEditorContent editor={editor} />

            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100, placement: 'top' }}
                >
                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-neutral-200 p-1">
                        <Toolbar editor={editor} />
                    </div>
                </BubbleMenu>
            )}

            {menuState.isOpen && menuState.position && (
                <div
                    style={{
                        position: 'absolute',
                        top: menuState.position.top,
                        left: menuState.position.left,
                        zIndex: 50,
                    }}
                >
                    <CommandMenu
                        ref={commandMenuRef}
                        items={menuState.filteredItems}
                        onSelectItem={handleCommandExecution}
                        selectedIndex={menuState.selectedIndex}
                        setSelectedIndex={(index) =>
                            setMenuState(prev => ({ ...prev, selectedIndex: index }))
                        }
                        query={menuState.query}
                    />
                </div>
            )}
        </div>
    );
} 