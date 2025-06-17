<script setup>
import { useItemTip } from '@/composables/common/useItemTip';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',

  }
});

const {
  isVisible,
  wrapper,
  itemTipStyle,
  handleMouseEnter,
  handleMouseLeave
} = useItemTip({ position: props.position });
</script>

<template>
  <div
    class="item-tip"
    ref="wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>

    <teleport to="body">
      <div
        v-if="isVisible"
        :style="itemTipStyle"
        :class="['item-tip-bubble', props.position]"
      >
        {{ props.text }}
        <div class="item-tip-arrow" :class="props.position"></div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.item-tip {
  width: fit-content;
  /* height: 100%; */
}

.item-tip-bubble {
  background: var(--secondary-c);
  color: var(--text-c);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: var(--tip-font-size);
  white-space: nowrap;
  box-shadow: var(--box-shadow-ui);
}

.item-tip-bubble {
  position: absolute;
  transform: translate(-50%, -50%);
}

.item-tip-bubble.top    { transform: translate(-50%, -100%); }
.item-tip-bubble.bottom { transform: translate(-50%, 0); }
.item-tip-bubble.left   { transform: translate(-100%, -50%); }
.item-tip-bubble.right  { transform: translate(0, -50%); }
.item-tip-bubble.bottom-right {transform: translate(0, 0);}
.item-tip-bubble.bottom-left {transform: translate(-100%, 0);}

.item-tip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.item-tip-arrow.top {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.left {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid var(--secondary-c);
}

.item-tip-arrow.right {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-right {
  left: 20px;
  top: -6px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-left {
  right: 20px;
  top: -6px;
  transform: translateX(50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}
</style>
