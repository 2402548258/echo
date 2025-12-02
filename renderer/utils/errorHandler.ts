import type { Plugin } from 'vue';
import logger from './logger';

export const errorHandler: Plugin = function (app) {
    // app.config.errorHandler = (err, instance, info) => {
    //     logger.error('Vue error:', err, instance, info);
    // };
    app.config.errorHandler = (err, instance, info) => {
        const payload = {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            info,
            // componentName: instance?.type?.name,
        };
        logger.error('Vue error:', payload);
    };

    window.onerror = (message, source, lineno, colno, error) => {
        logger.error('Window error:', message, source, lineno, colno, error);
    };
    
    window.onunhandledrejection = (event) => {
        logger.error('Unhandled Promise Rejection:', event);
    };
};

export default errorHandler;