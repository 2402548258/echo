export function useDialog() {
    const isDarkMode = usePreferredDark();
    const createDialog = (opts: CreateDialogProps) => {
        const isModal = opts.isModal ?? true; 
        const overlay = document.createElement('div');
        watchEffect(() => overlay.style.backgroundColor = isDarkMode.value
            ? 'rgba(0, 0, 0, 0.6)'
            : 'rgba(255, 255, 255, 0.6)'
        );
        return new Promise<string>((resolve) => {
            window.api.createDialog(opts).then(res => {
                resolve(res);
                if(!isModal) return;
                document.body.removeChild(overlay);
            });
            if(!isModal) return;
            document.body.appendChild(overlay);
            overlay.classList.add('dialog-overlay');
            setTimeout(() => overlay.classList.add('show'), 10);
        })
    }
    return { createDialog }
}

export default useDialog;