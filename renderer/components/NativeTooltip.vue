<script setup lang="ts">
import { logger } from '../utils/logger'

interface Props {
    content: string
}
defineOptions({ name: 'NativeTooltip' })
const props = defineProps<Props>()
const slots = useSlots() //defineSlots() 是 <script setup> 的编译期宏，只有在 <script setup> 中可用。
// 它接受一个泛型参数来声明各插槽的类型，返回值是已知键的对象，所以 TypeScript 可以在编译期提醒你漏写/误写插槽名，也能推断插槽 props 的类型。
if ((slots.default?.()?.length ?? 0) > 1) {
    logger.warn('NativeTooltip only support one slot.')
}

function updateTooltipContent(content:string){
    const slot = slots.default?.()
    if(slot && slot[0]?.el instanceof HTMLElement){
        slot[0].el.setAttribute('title',content)
    }
}

onMounted(()=>{
    updateTooltipContent(props.content)
})

watch(()=>props.content,(newVal)=>{
    updateTooltipContent(newVal)
})

</script>

<template>
    <template v-if="slots.default?.()[0].el">
        //slot是html元素，需要给slot的第一个元素加title属性
        <slot></slot>
    </template>
    <template v-else>
        //slot不存在或者slot的第一个元素不是html元素，则使用span包裹，并加title属性
        <span :title="content">
            <slot></slot>
        </span>
    </template>

</template>