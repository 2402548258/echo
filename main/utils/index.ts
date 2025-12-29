import { CONFIG_KEYS } from '@common/constants';
import logManager from '../service/LogService';

import en from '@locales/en.json';
import zh from '@locales/zh.json';
import configManager from '@main/service/ConfigService';
import path from 'path';

type MessageSchema = typeof zh;
const messages: Record<string, MessageSchema> = { en, zh }

export function createTranslator() {
    return (key?: string) => {
        if (!key) return void 0;
        try {
            const keys = key?.split('.');
            let result: any = messages[configManager.getValue(CONFIG_KEYS.LANGUAGE)];
            for (const _key of keys) {
                result = result[_key];
            }
            return result as string;
        } catch (e) {
            logManager.error('failed to translate key:', key, e);
            return key
        }
    }
}

let logo: string | void = void 0;
export function createLogo() {
    if (logo != null) {
        return logo;
    }
    logo = path.join(__dirname,'1.ico');
    return logo;
}