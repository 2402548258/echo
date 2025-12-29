interface WindowApi {
    openWindow: (name: WindowNames) => void;
    closeWindow: () => void;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
    isWindowMaximized: () => Promise<boolean>;

    setThemeMode: (mode: ThemeMode) => Promise<boolean>;
    getThemeMode: () => Promise<ThemeMode>;
    isDarkTheme: () => Promise<boolean>;
    onSystemThemeChange: (callback: (isDark: boolean) => void) => void;

    showContextMenu: (menuId: string, dynamicOptions?: string) => Promise<any>;
    contextMenuItemClick: (menuId: string, cb: (id: string) => void) => void;
    removeContextMenuListener: (menuId: string) => void;

    viewIsReady: () => void;

    getConfig: (key: string) => Promise<any>;
    setConfig: (key: string, value: any) => void;
    updateConfig: (value: any) => void;
    onConfigChange: (callback: (config: any) => void) => () => void;
    removeConfigChangeListener: (cb: (config: any) => void) => void;

    createDialog: (params: CreateDialogProps) => Promise<string>;
    _dialogFeedback: (val: 'cancel' | 'confirm', winId: number) => void;
    _dialogGetParams: () => Promise<CreateDialogProps>;


    startADialogueMessage: (params: CreateDialogMessageProps) => void;
    onDialogueBack: (cb: (data: DialogueBackStream) => void, messageId: number) => () => void;

    logger: {
        debug: (message: string, ...meta?: any[]) => void;
        info: (message: string, ...meta?: any[]) => void;
        warn: (message: string, ...meta?: any[]) => void;
        error: (message: string, ...meta?: any[]) => void;
    }
}

interface Window {
    api: WindowApi;
}

type ThemeMode = 'dark' | 'light' | 'system';


interface CreateDialogProps {
    winId?: string;
    title?: string;
    content: string;
    confirmText?: string;
    cancelText?: string;
    isModal?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface CreateDialogMessageProps {
    messages: DialogueMessageProps[];
    providerName: string;
    selectedModel: string;
    messageId: number;
    conversationId: number;
}

type DialogueMessageRole = 'user' | 'assistant'
interface DialogueMessageProps {
    role: DialogueMessageRole;
    content: string;
}

interface UniversalChunk {
    isEnd: boolean;
    result: string;
}

interface DialogueBackStream {
    messageId: number;
    data: UniversalChunk & { isError?: boolean };
}