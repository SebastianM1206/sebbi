"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const CommandMenu = forwardRef(({ items, onSelectItem, selectedIndex, setSelectedIndex, query }, ref) => {
    const selectItem = (index) => {
        const item = items[index];
        if (item) {
            onSelectItem(item);
        }
    };

    useEffect(() => {
        if (selectedIndex >= items.length && items.length > 0) {
            setSelectedIndex(items.length - 1);
        } else if (items.length === 0) {
            setSelectedIndex(0);
        }
    }, [items, selectedIndex, setSelectedIndex]);

    useImperativeHandle(ref, () => ({
        onKeyDown: (event) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((prevIndex) => (prevIndex + items.length - 1) % items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
                return true;
            }
            if (event.key === 'Enter') {
                if (items.length > 0 && selectedIndex < items.length) {
                    selectItem(selectedIndex);
                }
                return true;
            }
            return false;
        },
    }));

    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-md shadow-xl border border-neutral-200 p-1 w-80">
                <div className="px-2 pt-2 pb-1 text-xs font-semibold text-neutral-500">BLOCKS</div>
                <div className="p-2 text-sm text-neutral-500">
                    {query ? `No results for "${query}"` : 'No suggestions'}
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white rounded-md shadow-xl border border-neutral-200 p-1 w-80 max-h-[300px] overflow-hidden"
            style={{
                position: 'absolute',
                zIndex: 50,
            }}
        >
            <div className="px-2 pt-2 pb-1 text-xs font-semibold text-neutral-500">BLOCKS</div>
            <ScrollArea className="h-[250px]">
                {items.map((item, index) => (
                    <Button
                        key={item.title}
                        variant="ghost"
                        className={`w-full justify-start px-2 py-1.5 text-sm h-auto items-start ${index === selectedIndex
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white'
                            : 'hover:bg-neutral-100 text-neutral-700'
                            }`}
                        onClick={() => selectItem(index)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex items-center">
                            {item.icon && React.createElement(item.icon, {
                                className: `mr-2 h-5 w-5 ${index === selectedIndex ? 'text-white' : 'text-neutral-500'
                                    }`
                            })}
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{item.title}</span>
                                {item.description && (
                                    <span className={`text-xs ${index === selectedIndex ? 'text-white/80' : 'text-neutral-500'
                                        }`}>
                                        {item.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Button>
                ))}
            </ScrollArea>
        </div>
    );
});

CommandMenu.displayName = 'CommandMenu';
export default CommandMenu;
