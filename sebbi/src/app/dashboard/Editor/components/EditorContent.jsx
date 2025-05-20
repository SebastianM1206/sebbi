import React from 'react';
import { EditorContent as TiptapEditorContent, BubbleMenu } from "@tiptap/react";
import Toolbar from '../Toolbar';

export default function EditorContentWrapper({
    editor,
    menuState,
}) {


    let ghostSuggestion = null;
    if (menuState.isOpen && menuState.query && menuState.filteredItems && menuState.filteredItems.length > 0) {
        const topMatch = menuState.filteredItems[0];
        // Asegúrate de que topMatch y topMatch.title existan
        if (topMatch && topMatch.title && topMatch.title.startsWith(menuState.query) && topMatch.title.length > menuState.query.length) {
            ghostSuggestion = {
                prefix: menuState.query,
                suffix: topMatch.title.substring(menuState.query.length),
                fullText: topMatch.title,
                command: topMatch, // Este es el objeto de comando completo que se pasará a handleCommandExecution
            };
        }
    }

    return (
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 relative">
            {editor && <TiptapEditorContent editor={editor} />}


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


        </div>
    );
} 