<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'

const props = defineProps({
  // iconName: {
  //   type: String,
  //   required: true,
  // },
  // label: {
  //   type: String,
  //   required: true,
  // },
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

const showSubTools = ref(false)
const subToolPos = ref({ top: 0, left: 0 })
const wrapperRef = ref(null)

const onRightClick = async (e) => {
  e.preventDefault()
  if (!props.tool.subTools) return

  if (showSubTools.value) {
    showSubTools.value = false
    return
  }

  await nextTick()
  const rect = wrapperRef.value.getBoundingClientRect()
  subToolPos.value = {
    top: rect.top,
    left: rect.right + 10,
  }
  showSubTools.value = true
}

const onClickSubTool = (subToolKey) => {
  showSubTools.value = false
  emit('click', props.tool.key, subToolKey)
}

const onClickTool = () => {
  showSubTools.value = false
  emit('click', props.tool.key, null)
}

const handleClickOutside = (e) => {
  const toolEl = wrapperRef.value
  if (
    showSubTools.value &&
    toolEl &&
    !toolEl.contains(e.target) &&
    !document.querySelector('.subTools-popup')?.contains(e.target)
  ) {
    showSubTools.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

    <Teleport to="body" v-if="showSubTools && props.tool.subTools">
      <div
        class="subTools-popup"
        :style="{
          position: 'absolute',
          top: subToolPos.top + 'px',
          left: subToolPos.left + 'px',
        }"
      >
        <ItemTip v-for="sub in props.tool.subTools" :key="sub.key" :text="sub.tip" position="right">
          <div class="subTool" @click.stop="onClickSubTool(sub.key)">
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
