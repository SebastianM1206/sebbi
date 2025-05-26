import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const GhostTextPluginKey = new PluginKey('ghostText');

export const GhostTextExtension = Extension.create({
    name: 'ghostText',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: GhostTextPluginKey,
                state: {
                    init: () => ({
                        text: '',
                        show: false,
                    }),
                    apply: (tr, prev) => {
                        const meta = tr.getMeta(GhostTextPluginKey);
                        if (meta) {
                            if (meta.show === false) {
                                return { text: '', show: false };
                            }
                            return { ...prev, ...meta };
                        }
                        // If document or selection changes, component should send new meta.
                        // If no meta, keep previous state.
                        return prev;
                    },
                },
                props: {
                    decorations(state) {
                        const pluginState = GhostTextPluginKey.getState(state);
                        if (pluginState && pluginState.show && pluginState.text) {
                            const { selection } = state;
                            const { $head } = selection;

                            // Only show if cursor is at the end of its current text block
                            if ($head.parent.isTextblock && $head.pos === $head.end()) {
                                const widget = Decoration.widget(
                                    $head.pos, // Position for the widget
                                    () => {
                                        const span = document.createElement('span');
                                        span.className = 'ghost-text-inline';
                                        span.textContent = pluginState.text;
                                        return span;
                                    },
                                    {
                                        side: 1, // Render after the cursor position
                                        marks: [], // No marks applied to the widget itself
                                    }
                                );
                                return DecorationSet.create(state.doc, [widget]);
                            }
                        }
                        return DecorationSet.empty;
                    },
                },
            }),
        ];
    },
}); 