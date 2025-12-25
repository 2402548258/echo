
import { parseOpenAISetting, stringifyOpenAISetting } from "@common/utils";
import { OpenAIProvider } from "./OpenAIProvider";
import { Provider } from "@common/types";
import configManager from "@main/service/ConfigService";
import { CONFIG_KEYS } from "@common/constants";
import logManager from "@main/service/LogService";
import { decode } from "js-base64";

const providers = [
    {
        id: 1,
        name: 'bigmodel',
        title: '智谱AI',
        models: ['glm-4.5-flash'],
        openAISetting: {
            baseURL: 'https://open.bigmodel.cn/api/paas/v4',
            apiKey: '',
        },
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 2,
        name: 'deepseek',
        title: '深度求索 (DeepSeek)',
        models: ['deepseek-chat'],
        openAISetting: {
            baseURL: 'https://api.deepseek.com/v1',
            apiKey: '',
        },
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 3,
        name: 'siliconflow',
        title: '硅基流动',
        models: ['Qwen/Qwen3-8B', 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'],
        openAISetting: {
            baseURL: 'https://api.siliconflow.cn/v1',
            apiKey: '',
        },
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 4,
        name: 'qianfan',
        title: '百度千帆',
        models: ['ernie-speed-128k', 'ernie-4.0-8k', 'ernie-3.5-8k'],
        openAISetting: {
            baseURL: 'https://qianfan.baidubce.com/v2',
            apiKey: '',
        },
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
    {
        id: 5,
        name: 'openai',
        title: 'chatgpt',
        models: ['gpt-5', 'gpt-5.1-medium', 'o4-mini'],
        openAISetting: {
            baseURL: 'https://ai.liaobots.work/v1',
            apiKey: 'SvpjMec2rNyoN',
        },
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    },
];

interface _Provider extends Omit<Provider, 'openAISetting'> {
    openAISetting?: {
        apiKey: string,
        baseURL: string,
    };
}

function _parseProvider() {
    let result: Provider[] = [];
    let isBase64Parsed = false;
    const providerConfig = configManager.getValue(CONFIG_KEYS.PROVIDER)
    function mapMethod(provider: Provider) {
        return {
            ...provider,
            openAISetting: typeof provider.openAISetting === 'string'
                ? parseOpenAISetting(provider.openAISetting)
                : provider.openAISetting
        }
    }
    try {
        result = JSON.parse(decode(providerConfig)) as Provider[]
        isBase64Parsed = true
    } catch (error) {
        logManager.error(`parse base64 provider failed: ${error}`);
    }
    if (!isBase64Parsed) {
        try {
            result = JSON.parse(providerConfig) as Provider[]
        } catch (error) {
            logManager.error(`parse provider failed: ${error}`);
        }
    }
    if (!result.length) return
    return result.map(mapMethod) as _Provider[]
}

const getProviderConfig = () => {
    try {
        return _parseProvider() ; 
    } catch (error) {
        logManager.error(`get provider config failed: ${error}`);
        return null;
    }
}

export function createProvider(name: string) {
    const providers = getProviderConfig()
    if (!providers) {
        throw new Error('provider config not found');
    }
    for (const provider of providers) {
        if (provider.name === name) {
            if (!provider.openAISetting?.apiKey || !provider.openAISetting?.baseURL) {
                throw new Error('apiKey or baseURL not found');
            }
            // TODO: visible

            return new OpenAIProvider(provider.openAISetting.apiKey, provider.openAISetting.baseURL);
        }
    }

}