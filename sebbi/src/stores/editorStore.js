import { create } from 'zustand';

const useEditorStore = create((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),
}));

export default useEditorStore; 