<script setup lang="ts">
interface Props {
    direction: 'horizontal' | 'vertical';
    valIsNagetive?: boolean;
    size: number;
    maxSize: number;
    minSize: number;
}
interface Emits {
    (e: 'update:size', size: number): void;
}
defineOptions({ name: 'ResizeDivider' });
const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
    valIsNagetive: false,
})
const size = ref(props.size);
let isDragging = false;
let startSize = 0;
let startPoint = { x: 0, y: 0 };

function startDrag(event: MouseEvent) {
    isDragging = true;
    startPoint = { x: event.clientX, y: event.clientY };
    startSize = size.value;
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
}

function stopDrag() {
    isDragging = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
}

function onDrag(event:MouseEvent){
    if(!isDragging) return;
    const diffX = props.valIsNagetive ? startPoint.x - event.clientX : event.clientX - startPoint.x;
    const diffY = props.valIsNagetive ? startPoint.y - event.clientY : event.clientY - startPoint.y;
    if (props.direction === 'vertical'){

        let newSize = startSize + diffX;
        size.value = Math.min(Math.max(newSize,props.minSize),props.maxSize);
        emit('update:size',size.value);
        return 
    }
    if(props.direction === 'horizontal'){
        let newSize = startSize + diffY;
        size.value = Math.min(Math.max(newSize,props.minSize),props.maxSize);
        emit('update:size', size.value);
        return
    }
}
watch(() => props.size, (newVal) => {
    size.value = newVal;
})

</script>

<template>
    <div class="bg-transparent z-[999]" :class="direction"  @click.stop @mousedown="startDrag"></div>
</template>

<style scoped>
.vertical {
    width: 5px;
    height: 100%;
    cursor: ew-resize;
}
.vertical:hover {
    background-color: var(--color-tx-secondary);   
}
.horizontal {
    width: 100%;
    height: 5px;
    cursor: ns-resize;
}
.horizontal:hover {
    background-color: var(--color-tx-secondary);
}
</style>