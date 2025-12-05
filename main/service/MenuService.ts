import { ipcMain, Menu, MenuItemConstructorOptions } from "electron";
import logManager from "./LogService";
import { IPC_EVENTS } from "@common/constants";
import { cloneDeep } from "@common/utils";
import { isArray } from "lodash";
import { createTranslator } from "@main/utils";




let t: ReturnType<typeof createTranslator> = createTranslator();


class MenuService {


    private static _instance: MenuService;
    private _currentMenu?: Menu = void 0;
    private _menuTemplates: Map<string, MenuItemConstructorOptions[]> = new Map();
    public static getInstance(): MenuService {
        if (!this._instance) {
            this._instance = new MenuService();
        }
        return this._instance;
    }
    private constructor() {
        logManager.info("MenuService initialized");
        this._setupIpcListener();
    }

    private _setupIpcListener() {
        ipcMain.handle(IPC_EVENTS.SHOW_CONTEXT_MENU, (_, id, dynamicOptions) => new Promise((resolve) => this.showMenu(id, () => resolve(true), dynamicOptions)));
    }
    private _setupLanguageChangeListener() {

    }
    public register(id: string, menu: MenuItemConstructorOptions[]) {
        this._menuTemplates.set(id, menu);
        return id
    }
    public destroyMenu(id: string) {
        this._menuTemplates.delete(id);
    }

    public destroyed() {
        this._menuTemplates.clear();
        this._currentMenu = void 0;
    }
    public showMenu(id: string, onClose?: () => void, dynamicOptions?: string) {
        if (this._currentMenu) return
        const template = cloneDeep(this._menuTemplates.get(id));
        if (!template) {
            logManager.warn(`Menu template with id ${id} not found`);
            onClose?.()
            return;
        }

        const translateItem = (item: MenuItemConstructorOptions): MenuItemConstructorOptions => {
            if (item.submenu) {
                return {
                    ...item,
                    label: t(item.label) ?? void 0,
                    submenu: (item.submenu as MenuItemConstructorOptions[]).map(item => translateItem(item))
                }
            }
            return {
                ...item,
                label: t(item.label) ?? void 0
            }
        }

        let _dynamicOptions: Array<Partial<MenuItemConstructorOptions> & { id: string }> = []
        try {
            _dynamicOptions = Array.isArray(dynamicOptions) ? dynamicOptions : JSON.parse(dynamicOptions ?? '[]');
        } catch (error) {
            logManager.error(`Failed to parse dynamicOptions for menu ${id}: ${error}`);
        }

        function mergeSubItem(
            //item是单项而不是整个菜单
            item: MenuItemConstructorOptions,
            dynamicOptions: typeof _dynamicOptions = []
        ): MenuItemConstructorOptions {
            const _dynamicOptions = dynamicOptions ?? [];
            const dynamicOption = _dynamicOptions.find(opt => opt.id === item.id);
            const merged = dynamicOption ? { ...item, ...dynamicOption } : item;
            if (dynamicOption) {
                return merged
            }
            if (!merged.submenu) return merged;
            return {
                ...merged,
                submenu: (merged.submenu as MenuItemConstructorOptions[]).map(sub =>
                    mergeSubItem(sub, _dynamicOptions)
                ),
            };
        }

        const localizeTemplate = template.map(item => {
            if (!isArray(_dynamicOptions) || _dynamicOptions.length === 0) {
                return translateItem(item)
            }
            return translateItem(mergeSubItem(item, _dynamicOptions))
        })

        const menu = Menu.buildFromTemplate(localizeTemplate)
        this._currentMenu = menu
        menu.popup({
            callback: () => {
                this._currentMenu = void 0
                onClose?.()
            }
        })
    }


}

export const menuManager = MenuService.getInstance();
export default menuManager;