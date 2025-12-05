import { Conversation, Message, Provider } from "@common/types";
import { stringifyOpenAISetting } from "@common/utils";
import Dexie, { EntityTable } from "dexie";


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

