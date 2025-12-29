import { CONFIG_KEYS } from "@common/constants"
import useConfig from "./useConfig"

export function useFontSize(){
    const config = useConfig()

    const fontSize = ref(config[CONFIG_KEYS.FONT_SIZE] || 14)
    const setFontSize = (size:number)=>{
        document.body.style.fontSize = `${size}px`
        if (config[CONFIG_KEYS.FONT_SIZE] !== size) config[CONFIG_KEYS.FONT_SIZE]=size
        if(fontSize.value !== size) fontSize.value = size
    }

    watch(() => config[CONFIG_KEYS.FONT_SIZE] , (size)=>{
        setFontSize(size)
    })

    return {
        fontSize,
        setFontSize,
    }
}