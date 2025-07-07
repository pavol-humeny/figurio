<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useOneTool } from '@/composables/tools/useOneTool'

const editorStore = useEditorStore()

const props = defineProps({
  tool: {
    type: Object,
    required: true,
  },
  tip: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const { wrapperRef, subToolPos, onRightClick, onClickTab, onClickTool } = useOneTool(
  useEditorStore(),
  props,
  emit,
)
</script>

<template>
  <ItemTip :text="props.tip" position="top-right">
    <div class="tool-wrapper" ref="wrapperRef" @contextmenu="onRightClick">
      <div
        class="tool"
        :class="{ active: props.active, disabled: props.disabled }"
        @click.left="onClickTool"
      >
        <BaseIcon :name="props.tool.iconName" :size="27" :color="'var(--primary-c)'" />
      </div>
    </div>

    <Teleport
      to="body"
      v-if="editorStore.toolWithOpenSubToolsKey === props.tool.key && props.tool.subTools"
    >
      <div
        class="subTools-popup"
        :style="{
          position: 'absolute',
          top: subToolPos.top + 'px',
          left: subToolPos.left + 'px',
        }"
      >
        <ItemTip v-for="sub in props.tool.subTools" :key="sub.key" :text="sub.tip" position="right">
          <div class="subTool" @click.stop="onClickTab(sub.key)">
            <BaseIcon :name="sub.iconName" :size="27" :color="'var(--primary-c)'" />
          </div>
        </ItemTip>
      </div>
    </Teleport>
  </ItemTip>
</template>

<style setup>
.tool-wrapper {
  position: relative;
  width: 40px;
}

.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background: var(--secondary-c);
  transition: var(--default-transition);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.tool:hover {
  border: var(--border-modal);
}

.tool.active {
  border: var(--border-modal);
}

.tool.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.subTools-popup {
  z-index: 650;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subTool {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background: var(--secondary-c);
  transition: var(--default-transition);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.subTool:hover {
  border: var(--border-modal);
}

.subTool.active {
  border: var(--border-modal);
}

.subTool.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
