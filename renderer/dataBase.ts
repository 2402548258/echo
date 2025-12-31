import { Conversation, Message, Provider } from "@common/types";
import { parseOpenAISetting, stringifyOpenAISetting } from "@common/utils";
import Dexie, { EntityTable } from "dexie";
import logger from "./utils/logger";
import { CONFIG_KEYS } from "@common/constants";
import { decode, encode } from "js-base64";
import useConfig from "./hooks/useConfig";




export const providers: Provider[] = [
    {
        id: 1,
        name: 'bigmodel',
        title: '智谱AI',
        models: ['glm-4.5-flash'],
        openAISetting: stringifyOpenAISetting({
            baseURL: 'https://open.bigmodel.cn/api/paas/v4',
            apiKey: '',
        }),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 2,
        name: 'deepseek',
        title: '深度求索 (DeepSeek)',
        models: ['deepseek-chat'],
        openAISetting: stringifyOpenAISetting({
            baseURL: 'https://api.deepseek.com/v1',
            apiKey: '',
        }),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 3,
        name: 'siliconflow',
        title: '硅基流动',
        models: ['Qwen/Qwen3-8B', 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'],
        openAISetting: stringifyOpenAISetting({
            baseURL: 'https://api.siliconflow.cn/v1',
            apiKey: '',
        }),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 4,
        name: 'qianfan',
        title: '百度千帆',
        models: ['ernie-speed-128k', 'ernie-4.0-8k', 'ernie-3.5-8k'],
        openAISetting: stringifyOpenAISetting({
            baseURL: 'https://qianfan.baidubce.com/v2',
            apiKey: '',
        }),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 5,
        name: 'openai',
        title: 'chatgpt',
        models: ['gpt-5', 'gpt-5.1-medium', 'o4-mini'],
        openAISetting: stringifyOpenAISetting({
            baseURL: 'https://ai.liaobots.work/v1',
            apiKey: 'SvpjMec2rNyoN',
        }),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
];

export const database = new Dexie('EchoDB') as Dexie & {
    providers:EntityTable<Provider, 'id'>;
    conversations:EntityTable<Conversation, 'id'>;
    messages:EntityTable<Message, 'id'>;
}

database.version(1).stores({
    providers: '++id,name',
    conversations: '++id,providerId',
    messages: '++id,conversationId',
})

function _parseProvider() {
    let result: Provider[] = [];
    let isBase64Parsed = false;
    const config = useConfig()
    const providerConfig = config[CONFIG_KEYS.PROVIDER]
    try {
        result = JSON.parse(decode(providerConfig || '')) as Provider[]
        isBase64Parsed = true
    } catch (error) {
        logger.error(`parse base64 provider failed: ${error}`);
    }
    if (!isBase64Parsed) {
        try {
            result = JSON.parse(providerConfig || '') as Provider[]
        } catch (error) {
            logger.error(`parse provider failed: ${error}`);
        }
    }
    if (!result.length) return
    return result 
}

export async function initProvider() {
    const count = await database.providers.count()
    const LogProvider = _parseProvider()
    if( count === 0 ){
        if(LogProvider && LogProvider.length>0){
            await database.providers.clear()
            await database.providers.bulkAdd(LogProvider)
            logger.info('init LogProvider successfully')
            return
        }
        await database.providers.clear()
        await database.providers.bulkAdd(providers)
        logger.info('init defaultProvider successfully')          
    }
    
}

