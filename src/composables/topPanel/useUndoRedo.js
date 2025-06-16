import { ref } from 'vue';

export function useUndoRedo() {
  const canUndo = ref(true);
  const canRedo = ref(false);

  const undo = () => {
    // TODO - Implement undo logic here
    if(!canUndo.value) return;
    console.log("Undo action triggered");
  }
  const redo = () => {
    if(!canRedo.value) return;
    // TODO - Implement redo logic here
    console.log("Redo action triggered");
  }
  return {
    undo,
    redo,
    canUndo,
    canRedo
  };
}
