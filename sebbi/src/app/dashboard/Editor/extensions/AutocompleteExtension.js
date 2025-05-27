import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const AutocompletePluginKey = new PluginKey('autocomplete');

export const AutocompleteExtension = Extension.create({
    name: 'autocomplete',

    addOptions() {
        return {
            delay: 2000, // Delay antes de mostrar sugerencia
            suggestions: {}, // Objeto con las sugerencias estáticas (fallback)
            apiUrl: 'http://localhost:8000/api/v1/documents/autocomplete', // URL de la API
            useAI: true, // Usar IA en lugar de sugerencias estáticas
            minTextLength: 3, // Mínima longitud de texto para activar IA
            onSuggestionShow: () => { },
            onSuggestionHide: () => { },
            onAPIError: () => { }, // Callback para errores de API
        };
    },

    addProseMirrorPlugins() {
        const options = this.options;

        return [
            new Plugin({
                key: AutocompletePluginKey,

                state: {
                    init: () => ({
                        suggestion: '',
                        show: false,
                        position: null,
                        timeout: null,
                    }),

                    apply: (tr, prev, oldState, newState) => {
                        const meta = tr.getMeta(AutocompletePluginKey);

                        if (meta) {
                            if (meta.type === 'hide') {
                                return {
                                    suggestion: '',
                                    show: false,
                                    position: null,
                                    timeout: null,
                                };
                            }

                            if (meta.type === 'show') {
                                return {
                                    ...prev,
                                    suggestion: meta.suggestion,
                                    show: true,
                                    position: meta.position,
                                };
                            }

                            if (meta.type === 'updateTimeout') {
                                return {
                                    ...prev,
                                    timeout: meta.timeout,
                                };
                            }
                        }

                        // No ocultar sugerencias automáticamente por cambios en el documento
                        // Solo ocultar cuando el usuario específicamente interactúe o se mueva el cursor

                        return prev;
                    },
                },

                props: {
                    decorations: (state) => {
                        const pluginState = AutocompletePluginKey.getState(state);

                        if (!pluginState || !pluginState.show || !pluginState.suggestion) {
                            return DecorationSet.empty;
                        }

                        const { selection } = state;
                        const { $head } = selection;

                        // Solo mostrar si el cursor está al final del bloque de texto

                        if ($head.parent.isTextblock && $head.pos === $head.end()) {
                            const decoration = Decoration.widget(
                                $head.pos,
                                (view) => {
                                    const element = document.createElement('span');
                                    element.className = 'autocomplete-suggestion';
                                    element.style.cssText = `
                                        color: #9ca3af !important;
                                        opacity: 0.8 !important;
                                        font-style: normal !important;
                                        pointer-events: none !important;
                                        user-select: none !important;
                                        position: relative !important;
                                        white-space: pre-wrap !important;
                                        font-family: inherit !important;
                                        font-size: inherit !important;
                                        line-height: inherit !important;
                                        display: inline !important;
                                        background: none !important;
                                        border: none !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        vertical-align: baseline !important;
                                        overflow: visible !important;
                                    `;
                                    element.textContent = pluginState.suggestion;
                                    return element;
                                },
                                {
                                    side: 1,
                                    marks: [],
                                }
                            );

                            return DecorationSet.create(state.doc, [decoration]);
                        }

                        return DecorationSet.empty;
                    },

                    handleKeyDown: (view, event) => {
                        const pluginState = AutocompletePluginKey.getState(view.state);

                        if (pluginState && pluginState.show && pluginState.suggestion) {
                            // Aceptar sugerencia con Tab
                            if (event.key === 'Tab') {
                                event.preventDefault();

                                // Limpiar la sugerencia: solo asegurar que no empiece con salto de línea
                                let cleanSuggestion = pluginState.suggestion;

                                // Remover saltos de línea al inicio pero mantener los internos
                                while (cleanSuggestion.startsWith('\n') || cleanSuggestion.startsWith('\r')) {
                                    cleanSuggestion = cleanSuggestion.substring(1);
                                }

                                // Normalizar line endings pero mantener estructura
                                cleanSuggestion = cleanSuggestion
                                    .replace(/\r\n/g, '\n')
                                    .replace(/\r/g, '\n')
                                    .trim();

                                // Solo agregar espacio al inicio si no hay uno ya
                                const currentPos = view.state.selection.from;
                                const textBefore = view.state.doc.textBetween(Math.max(0, currentPos - 1), currentPos);
                                if (cleanSuggestion && !textBefore.endsWith(' ') && !cleanSuggestion.startsWith(' ')) {
                                    cleanSuggestion = ' ' + cleanSuggestion;
                                }

                                console.log('📝 Insertando texto limpio:', `"${cleanSuggestion}"`);

                                const transaction = view.state.tr.insertText(
                                    cleanSuggestion,
                                    view.state.selection.from
                                );

                                // Ocultar sugerencia
                                transaction.setMeta(AutocompletePluginKey, {
                                    type: 'hide'
                                });

                                view.dispatch(transaction);
                                options.onSuggestionHide();
                                return true;
                            }

                            // Ocultar sugerencia con Escape
                            if (event.key === 'Escape') {
                                event.preventDefault();

                                const transaction = view.state.tr.setMeta(AutocompletePluginKey, {
                                    type: 'hide'
                                });

                                view.dispatch(transaction);
                                options.onSuggestionHide();
                                return true;
                            }
                        }

                        return false;
                    },
                },

                view: (editorView) => {
                    let timeoutId = null;

                    const checkForSuggestions = async () => {
                        const { state } = editorView;
                        const { selection } = state;
                        const { $head } = selection;

                        // Obtener texto del párrafo actual
                        const currentNode = $head.parent;
                        if (!currentNode.isTextblock) return;

                        const currentText = currentNode.textContent;
                        console.log('🔍 Buscando sugerencia para texto:', `"${currentText}"`);

                        let suggestion = '';

                        if (options.useAI && currentText.trim().length >= options.minTextLength) {
                            try {
                                console.log('🤖 Llamando a la API de IA...');
                                suggestion = await getAISuggestion(currentText, options.apiUrl);
                                console.log('🎉 Sugerencia de IA obtenida:', suggestion || 'ninguna');
                            } catch (error) {
                                console.error('❌ Error al obtener sugerencia de IA:', error);
                                options.onAPIError(error);
                                // Fallback a sugerencias estáticas
                                suggestion = findSuggestion(currentText, options.suggestions);
                                console.log('🔄 Usando sugerencia estática como fallback:', suggestion || 'ninguna');
                            }
                        } else {
                            // Usar sugerencias estáticas
                            suggestion = findSuggestion(currentText, options.suggestions);
                            console.log('💡 Sugerencia estática encontrada:', suggestion || 'ninguna');
                        }

                        if (suggestion && suggestion.trim().length > 0) {
                            const transaction = state.tr.setMeta(AutocompletePluginKey, {
                                type: 'show',
                                suggestion: suggestion,
                                position: $head.pos,
                            });

                            editorView.dispatch(transaction);
                            options.onSuggestionShow(suggestion);
                        } else {
                            // Solo ocultar si hay una sugerencia visible actualmente
                            const currentPluginState = AutocompletePluginKey.getState(state);
                            if (currentPluginState && currentPluginState.show) {
                                const transaction = state.tr.setMeta(AutocompletePluginKey, {
                                    type: 'hide'
                                });

                                editorView.dispatch(transaction);
                                options.onSuggestionHide();
                            }
                        }
                    };

                    const scheduleCheck = () => {
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }

                        timeoutId = setTimeout(checkForSuggestions, options.delay);
                    };

                    // Escuchar cambios en el editor
                    const updateHandler = (event) => {
                        // Solo programar nueva verificación si es input del usuario
                        if (event.type === 'input' || event.type === 'keyup') {
                            scheduleCheck();
                        }
                    };

                    const keyDownHandler = (event) => {
                        // Ocultar sugerencias si el usuario está navegando o editando
                        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete'].includes(event.key)) {
                            const currentPluginState = AutocompletePluginKey.getState(editorView.state);
                            if (currentPluginState && currentPluginState.show) {
                                const transaction = editorView.state.tr.setMeta(AutocompletePluginKey, {
                                    type: 'hide'
                                });
                                editorView.dispatch(transaction);
                                options.onSuggestionHide();
                            }
                        }
                    };

                    editorView.dom.addEventListener('input', updateHandler);
                    editorView.dom.addEventListener('keyup', updateHandler);
                    editorView.dom.addEventListener('keydown', keyDownHandler);

                    return {
                        destroy: () => {
                            if (timeoutId) {
                                clearTimeout(timeoutId);
                            }
                            editorView.dom.removeEventListener('input', updateHandler);
                            editorView.dom.removeEventListener('keyup', updateHandler);
                            editorView.dom.removeEventListener('keydown', keyDownHandler);
                        }
                    };
                },
            }),
        ];
    },

    addCommands() {
        return {
            showSuggestion: (suggestion) => ({ state, dispatch }) => {
                if (dispatch) {
                    const transaction = state.tr.setMeta(AutocompletePluginKey, {
                        type: 'show',
                        suggestion: suggestion,
                        position: state.selection.from,
                    });
                    dispatch(transaction);
                }
                return true;
            },

            hideSuggestion: () => ({ state, dispatch }) => {
                if (dispatch) {
                    const transaction = state.tr.setMeta(AutocompletePluginKey, {
                        type: 'hide'
                    });
                    dispatch(transaction);
                }
                return true;
            },

            acceptSuggestion: () => ({ state, dispatch }) => {
                const pluginState = AutocompletePluginKey.getState(state);

                if (pluginState && pluginState.show && pluginState.suggestion) {
                    if (dispatch) {
                        // Limpiar la sugerencia: solo asegurar que no empiece con salto de línea
                        let cleanSuggestion = pluginState.suggestion;

                        // Remover saltos de línea al inicio pero mantener los internos
                        while (cleanSuggestion.startsWith('\n') || cleanSuggestion.startsWith('\r')) {
                            cleanSuggestion = cleanSuggestion.substring(1);
                        }

                        // Normalizar line endings pero mantener estructura
                        cleanSuggestion = cleanSuggestion
                            .replace(/\r\n/g, '\n')
                            .replace(/\r/g, '\n')
                            .trim();

                        // Solo agregar espacio al inicio si no hay uno ya
                        const currentPos = state.selection.from;
                        const textBefore = state.doc.textBetween(Math.max(0, currentPos - 1), currentPos);
                        if (cleanSuggestion && !textBefore.endsWith(' ') && !cleanSuggestion.startsWith(' ')) {
                            cleanSuggestion = ' ' + cleanSuggestion;
                        }

                        console.log('📝 Comando acceptSuggestion - insertando texto limpio:', `"${cleanSuggestion}"`);

                        const transaction = state.tr
                            .insertText(cleanSuggestion, state.selection.from)
                            .setMeta(AutocompletePluginKey, { type: 'hide' });

                        dispatch(transaction);
                    }
                    return true;
                }
                return false;
            },
        };
    },
});

// Función helper para encontrar sugerencias
function findSuggestion(text, suggestions) {
    const trimmedText = text.trim();
    console.log('🔎 Buscando sugerencia estática para:', `"${trimmedText}"`);

    for (const [trigger, completion] of Object.entries(suggestions)) {
        if (trimmedText.endsWith(trigger)) {
            // Si el texto actual es exactamente el trigger, mostrar la sugerencia
            if (trimmedText === trigger) {
                console.log(`✅ Sugerencia estática encontrada: "${completion}"`);
                return completion;
            }

            // Si el texto ya incluye parte del completion, no mostrar sugerencia
            const fullCompletion = trigger + completion;
            if (!trimmedText.includes(fullCompletion) && trimmedText.length === trigger.length) {
                console.log(`✅ Sugerencia estática encontrada: "${completion}"`);
                return completion;
            }
        }
    }

    return '';
}

// Función auxiliar para validar que la sugerencia no repita el texto original
function validateSuggestion(originalText, suggestion) {
    const original = originalText.trim().toLowerCase();
    const suggest = suggestion.trim().toLowerCase();

    // Si la sugerencia contiene el texto original, es inválida
    if (suggest.includes(original)) {
        console.log(`   ⚠️ Sugerencia contiene texto original, rechazada`);
        return false;
    }

    // Verificar que no haya palabras repetidas del final del texto original
    const originalWords = original.split(' ');
    const suggestionWords = suggest.split(' ');

    // Verificar las últimas 3 palabras del texto original
    const lastWords = originalWords.slice(-3);
    for (const word of lastWords) {
        if (word.length > 2 && suggestionWords.slice(0, 3).includes(word)) {
            console.log(`   ⚠️ Sugerencia contiene palabra repetida "${word}", rechazada`);
            return false;
        }
    }

    return true;
}

// Función para obtener sugerencias de IA
async function getAISuggestion(text, apiUrl) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text_input: text
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📡 Respuesta de la API:', data);

        // La API devuelve { autocompleted_text: "..." }
        if (data.autocompleted_text && data.autocompleted_text.trim()) {
            let suggestion = data.autocompleted_text.trim();
            const originalText = text.trim();

            console.log('🔧 Procesando respuesta de IA:');
            console.log(`   - Texto original: "${originalText}"`);
            console.log(`   - Respuesta completa: "${suggestion}"`);

            // Método 1: Si la sugerencia empieza exactamente con el texto original, quitarlo
            if (suggestion.startsWith(originalText)) {
                suggestion = suggestion.substring(originalText.length);
                console.log(`   - Después de quitar texto original: "${suggestion}"`);
            }

            // Método 2: Buscar el texto original dentro de la sugerencia y tomar solo lo que viene después
            const textIndex = suggestion.indexOf(originalText);
            if (textIndex === 0) {
                suggestion = suggestion.substring(originalText.length);
                console.log(`   - Método 2 aplicado: "${suggestion}"`);
            }

            // Método 3: Si la sugerencia aún contiene partes del texto original al inicio, limpiarla
            const words = originalText.split(' ');
            for (let i = words.length - 1; i >= 0; i--) {
                const partialText = words.slice(i).join(' ');
                if (suggestion.startsWith(partialText)) {
                    suggestion = suggestion.substring(partialText.length);
                    console.log(`   - Método 3 aplicado (quitando "${partialText}"): "${suggestion}"`);
                    break;
                }
            }

            // Limpiar la sugerencia: mantener saltos de línea internos pero limpiar el inicio
            suggestion = suggestion
                .replace(/\r\n/g, '\n')        // Normalizar Windows line endings
                .replace(/\r/g, '\n')          // Normalizar Mac line endings  
                .replace(/\t/g, ' ')           // Reemplazar tabs con espacios
                .replace(/[\u2028\u2029]/g, '\n') // Reemplazar separadores de línea Unicode con \n
                .trim();                       // Quitar espacios al inicio y final

            console.log(`   - Después de limpieza inicial: "${suggestion}"`);

            // Si después de todo el procesamiento la sugerencia está vacía o es muy corta, descartarla
            if (!suggestion || suggestion.length < 3) {
                console.log('   ❌ Sugerencia muy corta o vacía después del procesamiento');
                return '';
            }

            // Validar que la sugerencia no repita el texto original
            if (!validateSuggestion(originalText, suggestion)) {
                console.log('   ❌ Sugerencia rechazada por contener repeticiones');
                return '';
            }

            // Asegurar que la sugerencia NO empiece con salto de línea
            while (suggestion.startsWith('\n') || suggestion.startsWith('\r')) {
                suggestion = suggestion.substring(1).trim();
                console.log(`   - Removiendo salto de línea inicial: "${suggestion}"`);
            }

            // Asegurar que la sugerencia comience con un espacio SOLO si no está vacía y el texto original no termina con espacio
            if (suggestion && !originalText.endsWith(' ') && !suggestion.startsWith(' ')) {
                suggestion = ' ' + suggestion;
            }

            console.log('✨ Sugerencia de IA procesada final:', `"${suggestion}"`);
            return suggestion;
        }

        return '';
    } catch (error) {
        console.error('🚫 Error en la llamada a la API de IA:', error);
        throw error;
    }
} 