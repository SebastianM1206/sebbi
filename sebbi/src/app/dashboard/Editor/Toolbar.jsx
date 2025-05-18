import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Link as LinkIcon,
} from "lucide-react";

const Toolbar = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-neutral-200 p-1">
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
                        return; // Cancelled
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