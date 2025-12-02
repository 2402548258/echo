import { createI18n, I18n, type I18nOptions } from 'vue-i18n'
type LanguageType = 'zh' | 'en';
async function createI18nInstance() {
    const options: I18nOptions = {
        legacy: false, // 使用 Vue 2 风格 API（true）或 Composition API（false）
        locale: 'zh', // 默认语言
        fallbackLocale: 'zh', // 找不到翻译时回退的语言
        messages: {
            zh: await import('@locales/zh.json').then(r => r.default), // 懒加载中文包
            en: await import('@locales/en.json').then(r => r.default), // 懒加载英文包
        },
    };
    const i18n = createI18n(options)
    return i18n
}

export const i18n = await createI18nInstance()

export async function setLanguage(lang: LanguageType) {
    const _i18n: I18n = i18n
    if (_i18n.mode === 'legacy') {
        _i18n.global.locale = lang
        return
    }
    (_i18n.global.locale as Ref<LanguageType>).value = lang
}

export async function getLanguage(){
    if(i18n.mode === 'legacy'){
        return i18n.global.locale as LanguageType
    }
    return (i18n.global.locale as unknown as Ref<LanguageType>).value
}

export default i18n