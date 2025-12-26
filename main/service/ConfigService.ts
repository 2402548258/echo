import type { ConfigKeys, IConfig } from '@common/types';
import { app, BrowserWindow, ipcMain } from 'electron';
import { CONFIG_KEYS, IPC_EVENTS } from '@common/constants';
import { debounce} from '@common/utils';
import * as fs from 'fs';
import * as path from 'path';
import logManager from './LogService';



const DEFAULT_CONFIG: IConfig = {
    [CONFIG_KEYS.THEME_MODE]: 'system',
    [CONFIG_KEYS.PRIMARY_COLOR]: '#BB5BE7',
    [CONFIG_KEYS.LANGUAGE]: 'zh',
    [CONFIG_KEYS.FONT_SIZE]: 14,
    [CONFIG_KEYS.MINIMIZE_TO_TRAY]: false,
    [CONFIG_KEYS.PROVIDER]: '',
    [CONFIG_KEYS.DEFAULT_MODEL]: null,
}



export class ConfigService {
    private static _instance: ConfigService;
    private _config: IConfig;
    private _configPath: string;
    private _defaultConfig: IConfig = DEFAULT_CONFIG;
    private _listeners: Array<(config: IConfig) => void> = [];

    private constructor(){
        // 获取配置文件路径
        this._configPath = path.join(app.getPath('userData'), 'config.json');
        // 加载配置
        this._config = this._loadConfig();
        // 设置 IPC 事件
        this._setupIpcEvents();
        logManager.info('ConfigService initialized successfully.')
    }


    public static getInstance(){
        if(!this._instance){
            this._instance = new ConfigService()
        }
        return this._instance
    }

    private _setupIpcEvents(){
        const duration = 200;
        const handelUpdate = debounce((val) => this.update(val), duration);
        ipcMain.handle(IPC_EVENTS.GET_CONFIG, (_, key) => this.getValue(key));
        ipcMain.on(IPC_EVENTS.SET_CONFIG, (_, key, val) => this.set(key, val));
        ipcMain.on(IPC_EVENTS.UPDATE_CONFIG, (_, updates) => handelUpdate(updates));
    }

    private _loadConfig(): IConfig {
        try {
            if(fs.existsSync(this._configPath)){
                const configContent = fs.readFileSync(this._configPath,'utf-8')
                const config = {...this._defaultConfig,...JSON.parse(configContent)}
                logManager.info('Config loaded successfully from:', this._configPath);
                return config
            }
        } catch (error) {
            logManager.error('Failed to load config:', error)
        }
        return { ...this._defaultConfig }
    }

    private _notifyListeners(){
        BrowserWindow.getAllWindows().forEach(item => item.webContents.send(IPC_EVENTS.UPDATE_CONFIG, this._config));
        this._listeners.forEach(item => item({...this._config}))
    }

    private _saveConfig(){
         try {
             // 确保目录存在
             fs.mkdirSync(path.dirname(this._configPath), { recursive: true });
             // 写入
             fs.writeFileSync(this._configPath, JSON.stringify(this._config, null, 2), 'utf-8');
             // 通知监听者
             this._notifyListeners();
         } catch (error) {
             logManager.error('Failed to save config:', error)
         }
    }
    public getConfig(): IConfig {
        return {...this._config};
    }
    public getValue<T extends keyof IConfig>(key: T ): IConfig[T] {
        return this._config[key] 
    }

    public set<K extends keyof IConfig>(key: K, value: IConfig[K], autoSave: boolean = true){
        if (!(key in this._config)) return
        const oldValue = this._config[key];
        if (oldValue === value) return;
        this._config[key] = value
        if (autoSave) {
            this._saveConfig();
        }
        logManager.debug(`Config set: ${key} = ${value}`);
    }

    public update(updates: Partial<IConfig>, autoSave: boolean = true): void {
        this._config = { ...this._config, ...updates };
        autoSave && this._saveConfig();
    }

    public resetToDefault(): void {
        this._config = { ...this._defaultConfig };
        logManager.info('Config reset to default.');
        this._saveConfig();
    }

    public onConfigChange(listener: ((config: IConfig) => void)){
        this._listeners.push(listener);
        return () => this._listeners = this._listeners.filter(l => l !== listener);
    }
}

export const configManager = ConfigService.getInstance()

export default configManager