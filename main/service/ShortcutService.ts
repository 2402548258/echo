import {  globalShortcut,  type BrowserWindow } from 'electron';
import logManager from "./LogService";
import { throttle } from '@common/utils';


class ShortcutService {
    private static _instance: ShortcutService;
    private _registeredShortcuts: Map<string, Electron.Accelerator> = new Map();

    private constructor() {
        this._registerDefaultShortcuts();
        this._setupAppEvents();
        logManager.info('Shortcut service initialized');
    }
    private _registerDefaultShortcuts() { }

    private _setupAppEvents() { }
    public static getInstance() {
        if (!this._instance) {
            this._instance = new ShortcutService();
        }
        return this._instance;
    }
    public register(accelerator: Electron.Accelerator, id: string, callback: () => void) {
        try {
            if (this._registeredShortcuts.has(id)) {
                this.unRegister(id)
            }
            const throttleCallback = throttle(callback, 1000)
            const res = globalShortcut.register(accelerator, throttleCallback)
            if (res) {
                this._registeredShortcuts.set(id, accelerator)
                logManager.info(`Shortcut ${id} registered with accelerator ${accelerator}`);
            } else {
                logManager.error(`Failed to register shortcut ${id} with accelerator ${accelerator}`);
            }
            return res

        } catch (error) {
            logManager.error(`Failed to register shortcut ${id}: ${error}`);
            return false;
        }
    }

    public unRegister(id: string) {
        try {
            const accelerator = this._registeredShortcuts.get(id)
            if (accelerator) {
                globalShortcut.unregister(accelerator)
                this._registeredShortcuts.delete(id)
                logManager.info(`Shortcut ${id} unregistered with accelerator ${accelerator}`);
                return true;
            }
        } catch (error) {
            logManager.error(`Failed to unregister shortcut ${id}: ${error}`);
            return false;
        }
    }
    public unregisterAll(): void {
        try {
            globalShortcut.unregisterAll();
            this._registeredShortcuts.clear();
            logManager.info('All shortcuts unregistered');
        } catch (error) {
            logManager.error(`Failed to unregister all shortcuts: ${error}`);
        }
    }
    public isRegistered(accelerator: Electron.Accelerator): boolean {
        try {
            return globalShortcut.isRegistered(accelerator);
        } catch (error) {
            logManager.error(`Failed to check if shortcut ${accelerator} is registered: ${error}`);
            return false;
        }
    }
    public registerForWindow(
        window: BrowserWindow,
        callback: (input: Electron.Input) => boolean | void
    ) {
        const throttleCallback = throttle(callback,1000)
        window.webContents.on('before-input-event', (e, input) => {
            if (!window.isFocused()) return
            if (input.type === 'keyDown' && throttleCallback(input) as unknown as boolean === true){
                e.preventDefault
            }

        })
    }



}

export const shortcutManager = ShortcutService.getInstance()

export default shortcutManager