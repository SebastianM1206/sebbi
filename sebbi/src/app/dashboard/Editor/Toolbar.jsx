import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Link as LinkIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Pilcrow,
    CodeXml,
    Table,
    ChevronDown
} from "lucide-react";

const Toolbar = ({ editor }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const btnRef = useRef(null);

    if (!editor) return null;

    const blockFormatItems = [
        {
            label: "Text",
            icon: Pilcrow,
            action: () => editor.chain().focus().setParagraph().run(),
            isActive: !(
                editor.isActive('bulletList') ||
                editor.isActive('orderedList') ||
                editor.isActive('heading', { level: 1 }) ||
                editor.isActive('heading', { level: 2 }) ||
                editor.isActive('heading', { level: 3 }) ||
                editor.isActive('codeBlock') ||
                editor.isActive('table')
            )
        },
        {
            label: "Heading 1",
            icon: Heading1,
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 })
        },
        {
            label: "Heading 2",
            icon: Heading2,
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 })
        },
        {
            label: "Heading 3",
            icon: Heading3,
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editor.isActive('heading', { level: 3 })
        },
        {
            label: "Numbered List",
            icon: ListOrdered,
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList')
        },
        {
            label: "Bulleted List",
            icon: List,
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList')
        },
        {
            label: "Code Block",
            icon: CodeXml,
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock')
        },
        {
            label: "Insert Table",
            icon: Table,
            action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            isActive: editor.isActive('table')
        }
    ];

    const getActiveBlockLabel = () => {
        if (editor.isActive('bulletList')) return "Bulleted List";
        if (editor.isActive('orderedList')) return "Numbered List";
        if (editor.isActive('heading', { level: 1 })) return "H1";
        if (editor.isActive('heading', { level: 2 })) return "H2";
        if (editor.isActive('heading', { level: 3 })) return "H3";
        if (editor.isActive('codeBlock')) return "Code Block";
        if (editor.isActive('table')) return "Insert Table";
        return "Text";
    };

    // Cerrar el menú al hacer click fuera
    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-neutral-200 p-1 relative">
            {/* Menú personalizado */}
            <div className="relative">
                <Button
                    ref={btnRef}
                    variant="ghost"
                    className="h-8 px-2 text-sm flex items-center"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    type="button"
                >
                    {getActiveBlockLabel()}
                    <ChevronDown size={16} className="ml-1" />
                </Button>
                {open && (
                    <div
                        ref={menuRef}
                        className="absolute left-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1"
                        role="listbox"
                    >
                        {blockFormatItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.action();
                                    setOpen(false);
                                }}
                                className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-neutral-100 focus:bg-neutral-100 transition-colors ${item.isActive ? 'bg-neutral-100 font-semibold' : ''}`}
                                type="button"
                                tabIndex={0}
                                role="option"
                                aria-selected={item.isActive}
                            >
                                <item.icon size={16} className="mr-2" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-5 w-px bg-neutral-200 mx-1"></div>

            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-neutral-100' : ''}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold size={15} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-neutral-100' : ''}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic size={15} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive('strike') ? 'bg-neutral-100' : ''}`}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough size={15} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive('code') ? 'bg-neutral-100' : ''}`}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code size={15} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive('link') ? 'bg-neutral-100' : ''}`}
                onClick={() => {
                    const previousUrl = editor.getAttributes('link').href ?? '';
                    const url = window.prompt('URL:', previousUrl);

                    if (url === null) {
                        return;
                    }

                    if (url === '') {
                        editor.chain().focus().unsetLink().run();
                        return;
                    }

                    editor.chain().focus().setLink({ href: url }).run();
                }}
            >
                <LinkIcon size={15} />
            </Button>
        </div>
    );
};

export default Toolbar; 