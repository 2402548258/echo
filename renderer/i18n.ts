import { createI18n, type I18nOptions } from 'vue-i18n'

 async function createI18nInstance() {
    const options:I18nOptions = {
        legacy:false,
        locale:'zh',
        fallbackLocale:'zh',
        messages:{
            zh: await import('@locales/zh.json').then(r=>r.default),
            en: await import('@locales/en.json').then(r=>r.default)
        }
    }
     const i18n = createI18n(options)
     return i18n
    // return createI18n(options)
 }

 export const i18n = await createI18nInstance()

 export default i18n