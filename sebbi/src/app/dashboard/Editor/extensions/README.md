# Extensión de Autocompletado con IA para Tiptap

Esta extensión proporciona funcionalidad de autocompletado inteligente para el editor Tiptap, integrada con IA (Gemini) y con fallback a sugerencias estáticas.

## Características

- 🤖 **Integración con IA (Gemini)** para sugerencias inteligentes en tiempo real
- 🎯 **Texto ghost** que aparece al final de las líneas (estilo GitHub Copilot)
- ⌨️ **Teclas de acceso rápido** (Tab para aceptar, Esc para rechazar)
- 🎨 **Interfaz elegante** con botón flotante y toggle de IA
- 🔄 **Fallback automático** a sugerencias estáticas si la IA falla
- ⚡ **Configuración flexible** de delay, mínimo de caracteres y endpoints
- 🛡️ **Manejo de errores** robusto con notificaciones al usuario
- 🔧 **Fácil integración** con otros plugins de Tiptap

## Uso

### Configuración Básica

```javascript
import { AutocompleteExtension } from './extensions/AutocompleteExtension';

const editor = useEditor({
  extensions: [
    // ... otras extensiones
    AutocompleteExtension.configure({
      delay: 2000, // Delay en milisegundos antes de mostrar sugerencia
      suggestions: {
        "Hello": " world! This is a suggestion.",
        "React": " is a JavaScript library for building user interfaces.",
        // ... más sugerencias
      },
      onSuggestionShow: (suggestion) => {
        console.log('Sugerencia mostrada:', suggestion);
      },
      onSuggestionHide: () => {
        console.log('Sugerencia ocultada');
      },
    })
  ],
});
```

### Comandos Disponibles

```javascript
// Mostrar una sugerencia manualmente
editor.commands.showSuggestion("texto de sugerencia");

// Ocultar la sugerencia actual
editor.commands.hideSuggestion();

// Aceptar la sugerencia actual
editor.commands.acceptSuggestion();
```

### Controles de Teclado

- **Tab**: Acepta la sugerencia actual
- **Escape**: Rechaza/oculta la sugerencia actual

## Configuración Avanzada

### Opciones

| Opción | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `delay` | number | 2000 | Tiempo en ms antes de mostrar sugerencia |
| `suggestions` | object | {} | Objeto con pares trigger/completion |
| `onSuggestionShow` | function | () => {} | Callback cuando se muestra una sugerencia |
| `onSuggestionHide` | function | () => {} | Callback cuando se oculta una sugerencia |

### Ejemplo de Sugerencias

```javascript
const suggestions = {
  // Trigger simple
  "Hello": " world!",
  
  // Texto más largo
  "JavaScript is": " a versatile programming language that runs on both client and server.",
  
  // Sugerencias técnicas
  "React useState": " hook allows functional components to have state.",
  
  // Sugerencias académicas
  "The algorithm": " has a time complexity of O(n log n) in the average case.",
};
```

## Estilos CSS

La extensión incluye estilos CSS predefinidos que puedes personalizar:

```css
.autocomplete-suggestion {
  color: #9ca3af;
  opacity: 0.7;
  /* Personaliza según tus necesidades */
}
```

## Integración con Componentes React

```jsx
import AutocompleteSuggestionButton from './components/AutocompleteSuggestionButton';

function MyEditor() {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState("");

  return (
    <div className="editor-container">
      <AutocompleteSuggestionButton
        visible={showSuggestion}
        onAccept={() => editor.commands.acceptSuggestion()}
        suggestion={currentSuggestion}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
```

## Personalización

### Cambiar el Delay de Sugerencias

```javascript
AutocompleteExtension.configure({
  delay: 1000, // 1 segundo
})
```

### Agregar Callbacks Personalizados

```javascript
AutocompleteExtension.configure({
  onSuggestionShow: (suggestion) => {
    // Analytics, logging, etc.
    analytics.track('suggestion_shown', { suggestion });
  },
  onSuggestionHide: () => {
    analytics.track('suggestion_hidden');
  },
})
```

## Problemas Conocidos

- Las sugerencias solo aparecen al final de los bloques de texto
- El sistema actual es basado en coincidencias exactas de strings
- No hay soporte para sugerencias contextuales inteligentes (aunque se puede agregar)

## Contribuir

Para mejorar la extensión:

1. Agrega más algoritmos de matching inteligente
2. Implementa sugerencias basadas en IA
3. Añade soporte para múltiples idiomas
4. Mejora la detección de contexto

## Licencia

MIT License 