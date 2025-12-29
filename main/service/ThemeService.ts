import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { logManager } from './LogService';
import { CONFIG_KEYS, IPC_EVENTS } from '@common/constants'
import {configManager} from './ConfigService'

class ThemeService {
    private static _instance: ThemeService;
    private _isDark: boolean = nativeTheme.shouldUseDarkColors;
    private constructor() {
        const themeMode = configManager.getValue(CONFIG_KEYS.THEME_MODE);
        if(themeMode){
            nativeTheme.themeSource = themeMode;
            this._isDark = nativeTheme.shouldUseDarkColors;
        }
        this._setupIpcEvents();
        logManager.info(`ThemeService initialized. Current theme mode: ${nativeTheme.themeSource}, isDark: ${this._isDark}`);
    }
    private _setupIpcEvents() {
        ipcMain.handle(IPC_EVENTS.GET_THEME_MODE, () => {
            return nativeTheme.themeSource;
        })
        ipcMain.handle(IPC_EVENTS.IS_DARK_THEME, () => {
            return nativeTheme.shouldUseDarkColors;
        })
        ipcMain.handle(IPC_EVENTS.SET_THEME_MODE, (_e, mode: ThemeMode) => {
            nativeTheme.themeSource = mode;
            return nativeTheme.shouldUseDarkColors;
        })
        nativeTheme.on('updated',()=>{
            this._isDark = nativeTheme.shouldUseDarkColors;
            BrowserWindow.getAllWindows().forEach(win=>{ 
                win.webContents.send(IPC_EVENTS.THEME_MODE_UPDATED,this._isDark);
            })
            
        }) 
    }

    
    public static getInstance(): ThemeService {
        if (!this._instance) {
            this._instance = new ThemeService();
        }
        return this._instance
    }
    public get isDark() {  
        //get 关键字把 isDark 声明成 getter，调
        // 用方写 themeManager.isDark 就能拿到值，不需要 ()。
        return this._isDark;
    }

    public get themeMode() {
        return nativeTheme.themeSource;
    }
}


export const themeManager = ThemeService.getInstance();
export default themeManager;