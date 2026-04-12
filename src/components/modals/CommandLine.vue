<script setup>
/**
 * @file: CommandLine.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the command line modal. It provides a terminal-like interface for users to input commands and see output. It handles command processing, displays output lines, and manages the input field with a prompt showing the current user mode.
 */
import { useUserModeStore } from '@/stores/userModeStore';
import { useCommandLine } from '@/composables/modals/useCommandLine';

const userModeStore = useUserModeStore();

/**
 * Logic for command line modal
 */
const {
  command,
  output,
  outputRef,
  processCommand,
  inputRef,
} = useCommandLine(useUserModeStore());

</script>

<template>
  <div class="command-line-modal">
    <div class="cli-output" ref="outputRef">
      <div v-for="(line, index) in output" :key="index" class="cli-line">
        {{ line }}
      </div>
    </div>
    <div class="cli-input-wrapper">
      <span class="cli-prompt">{{ userModeStore.userMode }}@figurio:~/$ </span>
      <input ref="inputRef" v-model="command" @keydown.enter="processCommand" placeholder="Type a command..." autofocus
        maxlength="100" />
    </div>
  </div>
</template>


<style scoped>
.command-line-modal {
  background-color: var(--secondary-c);
  color: var(--text-c);
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  font-family: monospace;
}

.cli-output {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.cli-line {
  margin: 2px 0;
  white-space: pre-wrap;
}

.cli-input-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cli-prompt {
  color: var(--primary-c);
}

.cli-input-wrapper input {
  flex: 1;
  background: var(--secondary-c);
  border: none;
  border-bottom: 1px solid var(--text-placeholder-c);
  color: var(--text-placeholder-c);
  font-family: monospace;
  font-size: 14px;
  padding: 4px 6px;
}

.cli-input-wrapper input:focus {
  outline: none;
  border-bottom: 1px solid var(--primary-c);
}
</style>
