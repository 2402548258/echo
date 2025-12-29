// 统一维护主窗口逻辑（主进程）并暴露给整个应用复用
import type { WindowNames } from '@common/types';
import { CONFIG_KEYS, IPC_EVENTS, WINDOW_NAMES } from '@common/constants';
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  IpcMainInvokeEvent,
  nativeTheme,
  WebContentsView,
  type IpcMainEvent,
} from 'electron';
import { debounce } from '@common/utils';
import path from 'node:path';
import ThemeService, { themeManager } from './ThemeService';
import logManager from './LogService';
import configManager from './ConfigService';
import { createLogo } from '@main/utils';



interface WindowState {
  instance: BrowserWindow | void;
  isHidden: boolean;
  onCreate: ((window: BrowserWindow) => void)[];
  onClosed: ((window: BrowserWindow) => void)[];
}
// 新窗口可接受的尺寸配置，供调用 create 时传入
interface SizeOptions {
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

// 所有窗口共享的通用配置，保证安全策略一致
const SHARED_WINDOW_OPTIONS = {
  show: false,
  titleBarStyle: 'hidden',
  title: 'Echo',
  darkTheme: ThemeService.isDark,
  backgroundColor: ThemeService.isDark ? '#1E1E1E' : '#ffffff',
  webPreferences: {
    nodeIntegration: false, // 禁用 Node.js 集成，提高安全性
    contextIsolation: true, // 启用上下文隔离，防止渲染进程访问主进程 API
    sandbox: true, // 启用沙箱模式，进一步增强安全性
    backgroundThrottling: false,
    preload: path.join(__dirname, 'preload.js'),
  },
} as BrowserWindowConstructorOptions;

// 单例服务，集中管理窗口创建、IPC、生命周期
class WindowService {
  private static _instance: WindowService;
  private _windowStates: Record<WindowNames | string, WindowState> = {
    main: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
    setting: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
    dialog: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
  };
  private _logo = createLogo()

  private constructor() {
    this._setupIpcEvents(); // 构造时只注册一次 IPC 监听
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      const target = BrowserWindow.fromWebContents(e.sender);
      const winName = this.getName(target);
      this.close(target, this._isReallyClose(winName));
    };
    const handleMinimizeWindow = (e: IpcMainEvent) => {
      BrowserWindow.fromWebContents(e.sender)?.minimize();
    };
    const handleMaximizeWindow = (e: IpcMainEvent) => {
      this.toggleMax(BrowserWindow.fromWebContents(e.sender));
    };
    const handleIsWindowMaximized = (e: IpcMainInvokeEvent) => {
      return BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false;
    };

    ipcMain.on(IPC_EVENTS.CLOSE_WINDOW, handleCloseWindow);
    ipcMain.on(IPC_EVENTS.MINIMIZE_WINDOW, handleMinimizeWindow);
    ipcMain.on(IPC_EVENTS.MAXIMIZE_WINDOW, handleMaximizeWindow);
    ipcMain.handle(IPC_EVENTS.IS_WINDOW_MAXIMIZED, handleIsWindowMaximized);
  }

  private _isReallyClose(windowName: WindowNames | void) {
    if (windowName === WINDOW_NAMES.MAIN) return configManager.getValue(CONFIG_KEYS.MINIMIZE_TO_TRAY) === false; 
    if (windowName === WINDOW_NAMES.SETTING) return false;
    return true;
  }

  // 公开的创建方法：套用通用配置 + 尺寸限制
  public create(name: WindowNames, size: SizeOptions, moreOpts?: BrowserWindowConstructorOptions) {
    if (this.getInstance(name)) return
    const isHiddenWin = this._isHiddenWin(name);
    let window = this._createWinInstance(name, {...size, ...moreOpts});
    !isHiddenWin && this
      ._setupWinLifecycle(window, name)
      ._loadWindowTemplate(window, name)
    this._listenWinReady({ win: window, isHiddenWin, size });
    if (!isHiddenWin) {
      this._windowStates[name].instance = window;
      this._windowStates[name].onCreate.forEach(callback => callback(window));
    }
    if (isHiddenWin) {
      this._windowStates[name].isHidden = false;
      logManager.info(`Hidden window show: ${name}`)
    }
    return window;
  }

  private _listenWinReady(params: {
    win: BrowserWindow,
    isHiddenWin: boolean,
    size: SizeOptions,
  }) {
    const onReady = () => {
      params.win.once('show', () => setTimeout(() => { this._applySizeConstraints(params.win, params.size) }, 2))
      params.win.show()
    }
    if (!params.isHiddenWin){
      const handler = this._addLoadingView(params.win, params.size);
      handler?.(onReady)
      return 
    }
      onReady();  
  }
  public static getInstance(): WindowService {
    if (!this._instance) {
      this._instance = new WindowService();
    }
    return this._instance;
  }
  // 管理窗口生命周期与最大化状态上报
  private _setupWinLifecycle(window: BrowserWindow, _name: WindowNames) {
    const updateWinStatus = debounce(() => {
      if (!window?.isDestroyed()) {
        window.webContents?.send(
          IPC_EVENTS.MAXIMIZE_WINDOW + 'back',
          window.isMaximized(),
        );
      }
    }, 80);
    window.once('closed', () => {
      this._windowStates[_name].onClosed.forEach(callback => callback(window));
      window?.destroy();
      window?.removeListener('resize', updateWinStatus);
      this._windowStates[_name].instance = void 0;
      this._windowStates[_name].isHidden = false;
    });
    window.on('resize', updateWinStatus);
    return this;
  }

  // 负责加载正确的页面：开发模式走 Dev Server，生产模式读本地 html
  private _loadWindowTemplate(window: BrowserWindow, name: WindowNames) {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return window.loadURL(
        `${MAIN_WINDOW_VITE_DEV_SERVER_URL}${'/html/' + (name === 'main' ? '' : name)}`,
      );
    }
    window.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/html/${name === 'main' ? 'index' : name}.html`,
      ),
    );
  }


  private _addLoadingView(window: BrowserWindow, size: SizeOptions) {
    let loadingView: WebContentsView | void = new WebContentsView();
    let rendererIsReady = false;
    window.contentView?.addChildView(loadingView);
    loadingView.setBounds({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    });
    loadingView.webContents.loadFile(path.join(__dirname, 'loading.html'));
    const onRendererIsReady = (e: IpcMainEvent) => {
      if ((e.sender !== window?.webContents) || rendererIsReady) return;
      rendererIsReady = true;
      window.contentView.removeChildView(loadingView as WebContentsView);
      loadingView = void 0;
      ipcMain.removeListener(IPC_EVENTS.RENDERER_IS_READY, onRendererIsReady);
    }
    ipcMain.on(IPC_EVENTS.RENDERER_IS_READY, onRendererIsReady);
    return (cb: () => void) => loadingView?.webContents.once('dom-ready', () => {
      loadingView?.webContents.insertCSS(`body {
          background-color: ${themeManager.isDark ? '#2C2C2C' : '#FFFFFF'} !important; 
          --stop-color-start: ${themeManager.isDark ? '#A0A0A0' : '#7F7F7F'} !important;
          --stop-color-end: ${themeManager.isDark ? '#A0A0A0' : '#7F7F7F'} !important;
      }`);
      cb();
    })
  }

  private _applySizeConstraints(win: BrowserWindow, size: SizeOptions) {
    if (size.maxHeight && size.maxWidth) {
      win.setMaximumSize(size.maxWidth, size.maxHeight);
    }
    if (size.minHeight && size.minWidth) {
      win.setMinimumSize(size.minWidth, size.minHeight);
    }
  }

  private _handleCloseWindowState(target: BrowserWindow, really: boolean) {
    const name = this.getName(target) as WindowNames;

    if (name) {
      if (!really) this._windowStates[name].isHidden = true;
      else this._windowStates[name].instance = void 0;
    }
    setTimeout(() => {
      target[really ? 'close' : 'hide']?.();
      this._checkAndCloseAllWinodws();
    }, 200)
  }

  private _checkAndCloseAllWinodws() {
    if (!this._windowStates[WINDOW_NAMES.MAIN].instance || this._windowStates[WINDOW_NAMES.MAIN].instance?.isDestroyed())
      return Object.values(this._windowStates).forEach(win => win?.instance?.close());
    const minimizeToTray = configManager.getValue(CONFIG_KEYS.MINIMIZE_TO_TRAY); 
    if (!minimizeToTray && !this.getInstance(WINDOW_NAMES.MAIN)?.isVisible())
      return Object.values(this._windowStates).forEach(win => !win?.instance?.isVisible() && win?.instance?.close());
  }


  private _isHiddenWin(name: WindowNames) {
    return this._windowStates[name]?.isHidden;
  }

  private _createWinInstance(name: WindowNames, opts?: BrowserWindowConstructorOptions) {
    return this._isHiddenWin(name)
      ? this._windowStates[name].instance as BrowserWindow
      : new BrowserWindow({
        ...SHARED_WINDOW_OPTIONS,
        icon :this._logo,
        ...opts,
      });
  }

  // 基础窗口操作的安全包装
  public close(target: BrowserWindow | void | null, really: boolean = true) {
    if (!target) return;
    const name = this.getName(target);
    logManager.info(`Close window: ${name}, really: ${really}`);
    this._handleCloseWindowState(target, really);
  }

  public focus(target: BrowserWindow | void | null) {
    if (!target) return;
    const name = this.getName(target);
    if (target?.isMinimized()) {
      target?.restore();
      logManager.debug(`Window ${name} restored and focused`);
    } else {
      logManager.debug(`Window ${name} focused`);
    }

    target?.focus();
  }

  public getName(target: BrowserWindow | null | void): WindowNames | void {
    if (!target) return;
    for (const [name, win] of Object.entries(this._windowStates) as [WindowNames, { instance: BrowserWindow | void } | void][]) {
      if (win?.instance === target) return name;
    }
  }

  public getInstance(name: WindowNames) {
    if (this._windowStates[name].isHidden) return void 0;
    return this._windowStates[name].instance;
  }

  public toggleMax(target: BrowserWindow | void | null) {
    if (!target) return;
    target.isMaximized() ? target.unmaximize() : target.maximize();
  }

  public onWindowCreate(name: WindowNames, callback: (window: BrowserWindow) => void) {
    this._windowStates[name].onCreate.push(callback);
  }

  public onWindowClosed(name: WindowNames, callback: (window: BrowserWindow) => void) {
    this._windowStates[name].onClosed.push(callback);
  }
}

export const windowManager = WindowService.getInstance();
export default windowManager;