<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'

const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  label: {
    type: String,
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

</script>

<template>
  <ItemTip :text="props.tip" position="right">
    <div class="tool" :class="{ active: props.active, disabled: props.disabled }">
      <BaseIcon :name="props.iconName" :size="27" :color="'var(--primary-c)'" />
      <p>{{ props.label }}</p>
    </div>
  </ItemTip>
</template>

<style setup>
.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 20px;
  width: 90px;
  height: 90px;
  padding: 10px;
  background: var(--secondary-c);
  transition: var(--default-transition);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.tool:hover {
  border: var(--border-modal);
  transition: var(--default-transition);
}

.tool.active {
  border: var(--border-modal);
}

.tool.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.tool p {
  font-size: var(--text-font-size);
  font-weight: 500;
  color: var(--primary-c);
  text-align: center;
  line-height: 1.15;
}
</style>
