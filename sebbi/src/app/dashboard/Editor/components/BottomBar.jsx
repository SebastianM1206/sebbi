import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
    Quote,
    TextIcon,
    ImageIcon,
    TableIcon,
    FileCode,
    Braces,
    Undo,
    Redo,
    ChevronDown,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BottomBar({ editor, wordCount: wordCountProp }) {
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [wordCount, setWordCount] = useState(wordCountProp || 0);

    useEffect(() => {
        if (!editor) return;
        const updateWordCount = () => {
            const text = editor.getText();
            const count = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
            setWordCount(count);
        };
        updateWordCount();
        editor.on('update', updateWordCount);
        return () => editor.off('update', updateWordCount);
    }, [editor]);

    if (!editor) {
        return (
            <div className="border-t border-neutral-200/70 py-1.5 px-4 flex justify-center items-center bg-white shadow-sm">
                <div className="max-w-[800px] w-full flex justify-center items-center">
                    <div className="text-neutral-500 text-xs">Editor no disponible</div>
                </div>
            </div>
        );
    }

    // Función para insertar imagen desde URL o archivo
    const handleInsertImage = async () => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                editor.chain().focus().setImage({ src: e.target.result }).run();
            };
            reader.readAsDataURL(imageFile);
        } else if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
        }
        setOpenImageDialog(false);
        setImageUrl("");
        setImageFile(null);
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const addCodeBlock = () => {
        editor.chain().focus().toggleCodeBlock().run();
    };

    return (
        <div className="border-t border-neutral-200/70 py-1.5 px-4 flex justify-center items-center bg-white shadow-sm">
            <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insertar imagen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Desde URL</Label>
                        <Input
                            type="text"
                            placeholder="Pega la URL de la imagen"
                            value={imageUrl}
                            onChange={e => {
                                setImageUrl(e.target.value);
                                setImageFile(null);
                            }}
                        />
                        <Label>O sube una imagen</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                setImageFile(e.target.files[0]);
                                setImageUrl("");
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleInsertImage}
                            disabled={!imageUrl && !imageFile}
                        >
                            Insertar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="max-w-[800px] w-full flex justify-center items-center">
                <div className="flex items-center justify-center gap-2">
                    {/* Estilos de texto */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('bold') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                >
                                    <Bold size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Negrita</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('italic') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                >
                                    <Italic size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Cursiva</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('underline') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                >
                                    <Underline size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Subrayado</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('strike') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                >
                                    <Strikethrough size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Tachado</p></TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    {/* Encabezados */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium flex items-center text-neutral-700 hover:bg-neutral-100">
                                <TextIcon size={14} />
                                <span className="ml-1">Texto</span>
                                <ChevronDown size={12} className="ml-0.5 text-neutral-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                                <Heading1 size={16} className="mr-2" /> Título 1
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                                <Heading2 size={16} className="mr-2" /> Título 2
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                                <Heading3 size={16} className="mr-2" /> Título 3
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                                <TextIcon size={16} className="mr-2" /> Párrafo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    {/* Listas */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('bulletList') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                >
                                    <List size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Lista con viñetas</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('orderedList') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                >
                                    <ListOrdered size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Lista numerada</p></TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    {/* Elementos especiales */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={() => setOpenImageDialog(true)}
                                >
                                    <ImageIcon size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Insertar imagen</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={addTable}
                                >
                                    <TableIcon size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Insertar tabla</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${editor.isActive('codeBlock') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                    onClick={addCodeBlock}
                                >
                                    <FileCode size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Bloque de código</p></TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    {/* Deshacer/Rehacer */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editor.can().undo()}
                                >
                                    <Undo size={15} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Deshacer</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editor.can().redo()}
                                >
                                    <Redo size={15} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Rehacer</p></TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    {/* Contador de palabras */}
                    <div className="text-neutral-500 text-xs">
                        {wordCount} palabras
                    </div>
                </div>
            </div>
        </div>
    );
} 