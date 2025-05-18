import {
    TextIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    TableIcon,
    ImageIcon,
    FileCode,
    Quote,
} from "lucide-react";

export const getCommandItemsList = () => [
    {
        title: 'Text',
        description: 'Just start writing with plain text',
        icon: TextIcon,
        action: ({ editor }) => {
            editor.commands.setParagraph();
        },
    },
    {
        title: 'Heading 1',
        description: 'Big section heading',
        icon: Heading1,
        action: ({ editor }) => {
            editor.commands.setHeading({ level: 1 });
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        action: ({ editor }) => {
            editor.commands.setHeading({ level: 2 });
        },
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: Heading3,
        action: ({ editor }) => {
            editor.commands.setHeading({ level: 3 });
        },
    },
    {
        title: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: List,
        action: ({ editor }) => {
            editor.commands.toggleBulletList();
        },
    },
    {
        title: 'Numbered List',
        description: 'Create a list with numbering',
        icon: ListOrdered,
        action: ({ editor }) => {
            editor.commands.toggleOrderedList();
        },
    },
    {
        title: 'Code Block',
        description: 'Add a code snippet',
        icon: FileCode,
        action: ({ editor }) => {
            editor.commands.toggleCodeBlock();
        },
    },
    {
        title: 'Table',
        description: 'Add a simple table',
        icon: TableIcon,
        action: ({ editor }) => {
            editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
        },
    },
    {
        title: 'Image',
        description: 'Upload or embed an image',
        icon: ImageIcon,
        action: ({ editor }) => {
            const src = prompt('Enter image URL');
            if (src) {
                editor.commands.setImage({ src });
            }
        },
    },
    {
        title: 'Quote',
        description: 'Add a quote or citation',
        icon: Quote,
        action: ({ editor }) => {
            editor.commands.toggleBlockquote();
        },
    },
]; 