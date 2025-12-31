
import { parseOpenAISetting, stringifyOpenAISetting } from "@common/utils";
import { OpenAIProvider } from "./OpenAIProvider";
import { Provider } from "@common/types";
import configManager from "@main/service/ConfigService";
import { CONFIG_KEYS } from "@common/constants";
import logManager from "@main/service/LogService";
import { decode } from "js-base64";


interface _Provider extends Omit<Provider, 'openAISetting'> {
    openAISetting?: {
        apiKey: string,
        baseURL: string,
    };
}

function _parseProvider() {
    let result: Provider[] = [];
    let isBase64Parsed = false;
    const providerConfig = configManager.getValue(CONFIG_KEYS.PROVIDER)!
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

export const getProviderConfig = () => {
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