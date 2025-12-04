// 统一维护主窗口逻辑（主进程）并暴露给整个应用复用
import type { WindowNames } from '@common/types';
import { IPC_EVENTS } from '@common/constants';
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  IpcMainInvokeEvent,
  nativeTheme,
  type IpcMainEvent,
} from 'electron';
import { debounce } from '@common/utils';
import path from 'node:path';
import ThemeService from './ThemeService';



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
  titleBarStyle: 'hidden',
  title: 'Echo',
  darkTheme:ThemeService.isDark,
  backgroundColor: ThemeService.isDark ?'#1E1E1E':'#ffffff',  
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
  private _windowStates: Record<WindowNames|string, WindowState> = {
    main: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] }
  };

  private constructor() {
    this._setupIpcEvents(); // 构造时只注册一次 IPC 监听
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      this.close(BrowserWindow.fromWebContents(e.sender));
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

  public static getInstance(): WindowService {
    if (!this._instance) {
      this._instance = new WindowService();
    }
    return this._instance;
  }

  // 公开的创建方法：套用通用配置 + 尺寸限制
  public create(name: WindowNames, size: SizeOptions) {
    const window = new BrowserWindow({
      ...SHARED_WINDOW_OPTIONS,
      ...size,
    });

    this._setupWinLifecycle(window, name)._loadWindowTemplate(window, name);
    this._windowStates[name].onCreate.forEach(callback => callback(window));
    return window;
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
    window.once('ready-to-show', () => {
      window.webContents.openDevTools();  // 打开开发者工具
      window.show();
    });
    window.once('closed', () => {
      this._windowStates[_name].onClosed.forEach(callback => callback(window));
      window?.destroy();
      window?.removeListener('resize', updateWinStatus);
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

  // 基础窗口操作的安全包装
  public close(target: BrowserWindow | void | null) {
    if (!target) return;
    target.close();
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