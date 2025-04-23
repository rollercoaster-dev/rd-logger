import { Elysia, type Context } from 'elysia';
import { Logger } from '../core/logger.service';
import { type LoggerConfig } from '../core/logger.config';
import {
  runWithRequestContext,
  getCurrentRequestId,
  getRequestStore,
} from '../core/request-context';

export interface ElysiaLoggerOptions {
  /**
   * An existing Logger instance to use.
   * If not provided, a new Logger will be created with the options below.
   */
  loggerInstance?: Logger;
  /**
   * Configuration options for the Logger.
   * Ignored if loggerInstance is provided.
   */
  loggerOptions?: Partial<LoggerConfig>;
  /**
   * Function to determine if a request should be skipped for logging.
   * Useful for excluding health checks, static assets, etc.
   * @param context Elysia context (subset available in onRequest/onAfterHandle)
   * @returns true to skip logging, false otherwise
   */
  skip?: (context: Pick<Context, 'request' | 'store' | 'set'>) => boolean;
  /**
   * Customize the log message for incoming requests.
   * @param context Elysia context (subset available in onRequest)
   * @param store Request context store
   * @returns Log message string
   */
  requestMessage?: (
    context: Pick<Context, 'request' | 'store' | 'set'>,
    store: { requestId: string }
  ) => string;
  /**
   * Customize the log message for completed requests.
   * @param context Elysia context (subset available in onAfterHandle)
   * @param store Request context store
   * @param duration Request duration in ms
   * @returns Log message string
   */
  responseMessage?: (
    context: Pick<Context, 'request' | 'store' | 'set'>,
    store: { requestId: string },
    duration: number
  ) => string;
}

/**
 * Elysia plugin for neuro-friendly logging and request context management.
 *
 * @param options Configuration options for the logger plugin.
 * @returns Elysia plugin instance.
 */
export const elysiaLogger = (options: ElysiaLoggerOptions = {}) => {
  const logger = options.loggerInstance || new Logger(options.loggerOptions);

  const plugin = new Elysia({ name: '@rollercoaster-dev/elysia-logger' })
    // 1. Setup Request Context and Log Incoming Request
    .onRequest((context) => {
      const existingRequestId = context.request.headers.get('x-request-id');

      // Wrap the rest of the request lifecycle in the async context
      return runWithRequestContext(() => {
        const store = getRequestStore()!;
        const requestId = store.requestId;

        // Make requestId available directly on context.store for convenience
        (context.store as any).requestId = requestId;

        // Add requestId to response headers
        context.set.headers['x-request-id'] = requestId;

        // Check if logging should be skipped for this request
        if (options.skip?.(context as Pick<Context, 'request' | 'store' | 'set'>)) {
          return; // Skip logging
        }

        const method = context.request.method;
        const path = new URL(context.request.url).pathname;

        const message = options.requestMessage
          ? options.requestMessage(context as Pick<Context, 'request' | 'store' | 'set'>, store)
          : `▶ Incoming request`;

        logger.info(message, {
          method,
          path,
          requestId,
        });
      }, existingRequestId);
    })
    // 2. Log Completed Request
    .onAfterHandle((context) => {
      // Check if logging should be skipped for this request
      if (options.skip?.(context as Pick<Context, 'request' | 'store' | 'set'>)) {
        return; // Skip logging
      }

      const store = getRequestStore()!;
      const requestId = store.requestId;
      const startTime = store.requestStartTime;
      const duration = Date.now() - startTime;

      const method = context.request.method;
      const path = new URL(context.request.url).pathname;
      const status = context.set.status ?? 200; // Default to 200 if status not set

      const message = options.responseMessage
        ? options.responseMessage(context as Pick<Context, 'request' | 'store' | 'set'>, store, duration)
        : `◀ Request completed`;

      // Ensure status is treated as a number for comparison
      const numericStatus = typeof status === 'string' ? parseInt(status, 10) : status;

      const logLevel = numericStatus >= 500 ? 'error' : numericStatus >= 400 ? 'warn' : 'info';

      logger[logLevel](message, {
        method,
        path,
        status,
        duration: `${duration}ms`,
        requestId,
      });
    })
    // 3. Log Errors
    .onError((context) => {
      const store = getRequestStore(); // May not be available if error happens before onRequest context setup
      const requestId = store?.requestId || 'unknown';
      const error = context.error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log the error with context
      logger.error(`Unhandled error: ${errorMessage}`, {
        error: error, // Pass the raw error object to the logger
        code: context.code,
        requestId,
      });

      // Optionally, return a standardized error response
      // context.set.status = 500;
      // return {
      //   error: 'Internal Server Error',
      //   message: error.message, // Be cautious about exposing error details in production
      //   requestId,
      // };
    });

  return plugin;
};
