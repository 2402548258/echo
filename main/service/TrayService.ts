import { Tray, Menu, ipcMain, app } from 'electron';
import { createTranslator, createLogo } from '../utils';
import { CONFIG_KEYS, IPC_EVENTS, WINDOW_NAMES, MAIN_WIN_SIZE, SHORTCUT_KEYS } from '@common/constants';

import logManager from './LogService';
// TODO: shortcutManager
import windowManager from './WindowService';
import configManager from './ConfigService';
import shortcutManager from './ShortcutService';
let t: ReturnType<typeof createTranslator> = createTranslator();

class TrayService {
    private static _instance: TrayService;
    private _tray: Tray | null = null;
    private _removeLanguageListener?: () => void;
    constructor() {
        this._setupLanguageChangeListener()
        logManager.info('TrayService initialized successfully.');
    }

    private _setupLanguageChangeListener() {
        this._removeLanguageListener = configManager.onConfigChange((config) => {
            if (!config[CONFIG_KEYS.LANGUAGE]) return;
            t = createTranslator();
            if (this._tray) {
                this._updateTray();
            }
        })
    }
    private _updateTray() {
        if (!this._tray) {
            this._tray = new Tray(createLogo())
        }
        const showWindow = () => {
            const mainWindow = windowManager.getInstance(WINDOW_NAMES.MAIN);
            if (mainWindow && mainWindow?.isVisible() && !mainWindow?.isFocused()) {
                return mainWindow.focus();
            }
            if (mainWindow?.isMinimized()) {
                return mainWindow?.restore();
            }
            if (mainWindow?.isVisible() && mainWindow?.isFocused()) return;

            //确保关闭或隐藏后才调用create

            windowManager.create(WINDOW_NAMES.MAIN, MAIN_WIN_SIZE);
        }
        shortcutManager.register(SHORTCUT_KEYS.SHOW_WINDOW, 'tray.showWindow', showWindow);
        this._tray.setToolTip(t('tray.tooltip')!)
        this._tray.setContextMenu(Menu.buildFromTemplate([
            { label: t('tray.showWindow'), accelerator: SHORTCUT_KEYS.SHOW_WINDOW, click: showWindow },
            { type: 'separator' },
            { label: t('settings.title'), click: () => ipcMain.emit(`${IPC_EVENTS.OPEN_WINDOW}:${WINDOW_NAMES.SETTING}`) },
            { role: 'quit', label: t('tray.exit') }
        ]));

        this._tray.removeAllListeners('click');
        this._tray.on('click', showWindow)



    }


    private _handleAppQuit?: () => void;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new TrayService();
        }
        return this._instance;
    }

    public create() {
        if (this._tray) return;
        this._updateTray();
        this._handleAppQuit = () => {
            this.destroy();
            shortcutManager.unRegister('tray.showWindow');
        };
        app.on('quit', this._handleAppQuit
        )
    }

    public destroy() {
        this._tray?.destroy();
        this._tray = null;
        if (this._handleAppQuit) {
            app.removeListener('quit', this._handleAppQuit);
            this._handleAppQuit = void 0;
        }
        shortcutManager.unRegister('tray.showWindow');
        if (this._removeLanguageListener) {
            this._removeLanguageListener();
            this._removeLanguageListener = void 0;
        }
    }
}

export const trayManager = TrayService.getInstance();
export default trayManager;

