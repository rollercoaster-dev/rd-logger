/**
 * @rollercoaster-dev/rd-logger
 * Main entry point
 */

import { Logger } from './core/logger.service';
import { DEFAULT_LOGGER_CONFIG } from './core/logger.config';

// Export core logger class
export { Logger } from './core/logger.service';

// Export config types and defaults
export {
  LogLevel,
  LoggerConfig,
  DEFAULT_LOGGER_CONFIG,
  LOG_LEVEL_PRIORITY,
  DEFAULT_LEVEL_COLORS,
  DEFAULT_LEVEL_ICONS
} from './core/logger.config';

// Export a default logger instance with default configuration
// Users can import this directly for simple use cases
export const defaultLogger = new Logger();

// Export core Request Context functions
export {
  runWithRequestContext,
  getRequestStore,
  getCurrentRequestId,
  getCurrentRequestStartTime
} from './core/request-context';
export type { RequestStore } from './core/request-context'; // Export type

// Export core Query Logger class and types/defaults
export { QueryLogger } from './core/query-logger';
export {
  QueryLogEntry,
  QueryLoggerConfig,
  DEFAULT_QUERY_LOGGER_CONFIG
} from './core/query-logger';

// Export Framework Adapters

export { honoLogger, honoErrorHandler } from './adapters/hono';
export type { HonoLoggerOptions } from './adapters/hono';
export { expressLogger, expressErrorHandler } from './adapters/express';
export type { ExpressLoggerOptions } from './adapters/express';
export { runWithGenericContext } from './adapters/generic';
export type { GenericContextOptions } from './adapters/generic';

// TODO: Export other framework adapters once implemented
