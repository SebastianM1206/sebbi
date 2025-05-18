"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { TooltipProvider } from "@/components/ui/tooltip";
import useEditorStore from '@/stores/editorStore';

import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import EditorContentWrapper from './components/EditorContent';
import SaveIndicator from './components/SaveIndicator';
import { getCommandItemsList } from './constants/commandItems';

export default function NotionStyleEditor() {
    const [documentTitle, setDocumentTitle] = useState("Sin título");
    const [wordCount, setWordCount] = useState(0);
    const [menuState, setMenuState] = useState({
        isOpen: false,
        position: null,
        query: '',
        range: null,
        selectedIndex: 0,
        filteredItems: [],
    });

    const { setEditor } = useEditorStore();
    const commandMenuRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'first-heading',
                    },
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading' && node.attrs.level === 1) {
                        return 'Sin título'
                    }
                    return 'Escribe algo...'
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-600 underline',
                },
            }),
        ],
        content: '<h1></h1><p></p>',
        onUpdate: ({ editor: currentEditor }) => {
            // Asegurar que siempre exista un h1 al inicio
            const firstNode = currentEditor.state.doc.firstChild;
            if (!firstNode || firstNode.type.name !== 'heading' || firstNode.attrs.level !== 1) {
                currentEditor.chain()
                    .focus()
                    .insertContentAt(0, '<h1></h1>')
                    .run();
            }

            // Obtener el título actual
            const titleText = firstNode?.textContent.trim() || '';
            setDocumentTitle(titleText || "Sin título");

            // Actualizar conteo de palabras
            const text = currentEditor.getText();
            const words = text.split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);

            // Lógica del menú de comandos
            const { selection } = currentEditor.state;
            const { from, to, empty } = selection;

            if (!empty) {
                if (menuState.isOpen) closeMenuHandler();
                return;
            }

            const currentBlock = currentEditor.state.doc.resolve(from).parent;
            const currentBlockStartPos = currentEditor.state.doc.resolve(from).start(currentEditor.state.doc.resolve(from).depth);
            const textBeforeCursor = currentBlock.textBetween(0, from - currentBlockStartPos, '\n');

            if (textBeforeCursor.startsWith('/') &&
                !textBeforeCursor.includes(' ', 1) &&
                currentBlock.content.size === textBeforeCursor.length &&
                currentBlock.type.name === 'paragraph'
            ) {
                const currentQuery = textBeforeCursor.substring(1);
                const commandTextRange = {
                    from: currentBlockStartPos,
                    to: currentBlockStartPos + textBeforeCursor.length
                };

                if (!menuState.isOpen || menuState.range?.from !== commandTextRange.from) {
                    const coords = currentEditor.view.coordsAtPos(currentBlockStartPos + 1);
                    setMenuState({
                        isOpen: true,
                        position: {
                            top: coords.bottom + window.scrollY,
                            left: coords.left
                        },
                        query: currentQuery,
                        range: commandTextRange,
                        selectedIndex: 0,
                        filteredItems: getCommandItemsList().filter(item =>
                            item.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(currentQuery.toLowerCase())
                        ).slice(0, 10),
                    });
                } else {
                    setMenuState(prev => ({
                        ...prev,
                        query: currentQuery,
                        range: commandTextRange,
                        filteredItems: getCommandItemsList().filter(item =>
                            item.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(currentQuery.toLowerCase())
                        ).slice(0, 10),
                    }));
                }
            } else if (menuState.isOpen) {
                closeMenuHandler();
            }
        },
        onCreate: ({ editor }) => {
            setEditor(editor);
        },
        onDestroy: () => {
            setEditor(null);
        },
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-full prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-pre:bg-neutral-100 prose-pre:p-2 prose-pre:rounded",
            },
        },
    });

    const closeMenuHandler = () => {
        setMenuState({
            isOpen: false,
            position: null,
            query: '',
            range: null,
            selectedIndex: 0,
            filteredItems: [],
        });
    };

    const handleCommandExecution = (item) => {
        if (!editor || !menuState.range) return;

        editor.chain()
            .focus()
            .deleteRange(menuState.range)
            .run();

        item.action({ editor });
        closeMenuHandler();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!menuState.isOpen || !editor) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenuHandler();
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
                event.preventDefault();
                commandMenuRef.current?.onKeyDown(event);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [menuState.isOpen, editor]);


    if (!editor) return null;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-col h-screen bg-white text-neutral-800">
                <TopBar
                    documentTitle={documentTitle}
                    setDocumentTitle={setDocumentTitle}
                />

                <div className="flex-grow overflow-y-auto relative">
                    <EditorContentWrapper
                        editor={editor}
                        menuState={menuState}
                        commandMenuRef={commandMenuRef}
                        handleCommandExecution={handleCommandExecution}
                        setMenuState={setMenuState}
                    />
                    <SaveIndicator />
                </div>

                <BottomBar
                    editor={editor}
                    wordCount={wordCount}
                />
            </div>
        </TooltipProvider>
    );
}
