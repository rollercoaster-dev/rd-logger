import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {
  LogLevel,
  LoggerConfig,
  DEFAULT_LOGGER_CONFIG,
  LOG_LEVEL_PRIORITY,
  DEFAULT_LEVEL_COLORS,
  DEFAULT_LEVEL_ICONS
} from './logger.config';

/**
 * Safely stringify objects for logging, handling circular references
 * @param obj Object to stringify
 * @returns String representation of the object
 */
function safeStringify(obj: any): string {
  const seen = new Set();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
}

/**
 * Format error objects for logging, including stack traces if configured
 * @param error Error object
 * @param config Logger configuration
 * @returns Formatted error context
 */
function formatError(error: Error, config: LoggerConfig): Record<string, string> {
  const errorContext: Record<string, string> = {
    message: error.message
  };

  if (config.includeStackTrace && error.stack) {
    // Format stack trace for better readability
    errorContext.stack = error.stack
      .split('\n')
      .slice(1) // Remove the first line (error message)
      .map(line => line.trim())
      .join('\n');
  }

  return errorContext;
}

/**
 * Ensure directory exists for log file
 */
function ensureLogDirectoryExists(filePath: string): void {
  const logDir = path.dirname(filePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Get a relative time string (e.g., "just now", "2 minutes ago")
 * @param date Date to format
 * @returns Relative time string or null if the time difference is too large
 */
function getRelativeTimeString(date: Date): string | null {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  // Only show relative time for recent events (within the last hour)
  if (diffSeconds < 5) {
    return 'just now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  return null; // Not recent enough for relative time
}

/**
 * Format a date in a human-readable format
 * @param date Date to format
 * @param use24HourFormat Whether to use 24-hour format
 * @param useRelativeTime Whether to use relative time for recent events
 * @returns Formatted date string
 */
function formatDate(date: Date, use24HourFormat = true, useRelativeTime = true): string {
  // Try relative time first if enabled
  if (useRelativeTime) {
    const relativeTime = getRelativeTimeString(date);
    if (relativeTime) {
      return relativeTime;
    }
  }

  // Otherwise, format as date and time
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  if (use24HourFormat) {
    // 24-hour format
    return `${month} ${day}, ${hours.toString().padStart(2, '0')}:${minutes}:${seconds}.${milliseconds}`;
  } else {
    // 12-hour format with AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${month} ${day}, ${hour12}:${minutes}:${seconds}.${milliseconds} ${ampm}`;
  }
}

/**
 * Enhanced neuro-friendly logger class
 */
export class Logger {
  private config: LoggerConfig;
  private levelColors: Record<LogLevel, (text: string) => string>;
  private levelIcons: Record<LogLevel, string>;

  constructor(options?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...options };
    // Merge default and custom colors/icons
    this.levelColors = { ...DEFAULT_LEVEL_COLORS, ...(this.config.levelColors || {}) };
    this.levelIcons = { ...DEFAULT_LEVEL_ICONS, ...(this.config.levelIcons || {}) };

    // Ensure log directory exists immediately if file logging is enabled
    if (this.config.logToFile) {
      try {
        ensureLogDirectoryExists(this.config.logFilePath);
      } catch (error: any) {
        // Log error to console if directory creation fails
        console.error(`Failed to create log directory '${path.dirname(this.config.logFilePath)}': ${error.message}`);
        this.config.logToFile = false; // Disable file logging
      }
    }
  }

  /**
   * Write log entry to file if configured
   * @param entry Log entry string
   */
  private writeToLogFile(entry: string): void {
    if (this.config.logToFile) {
      try {
        // We assume directory exists from constructor check, but double-check write permissions might fail
        fs.appendFileSync(this.config.logFilePath, entry + '\n');
      } catch (error: any) {
        console.error(`Failed to write to log file '${this.config.logFilePath}': ${error.message}`);
        // Optionally disable future file logging attempts for this instance?
        // this.config.logToFile = false;
      }
    }
  }

  /**
   * Main logging function with neuro-friendly formatting
   * @param level Log level
   * @param message Log message
   * @param context Additional context (optional)
   */
  public log(level: LogLevel, message: string, context: Record<string, any> = {}): void {
    // Check if this log level should be shown based on configuration
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.level]) {
      return;
    }

    const icon = this.levelIcons[level];
    const now = new Date();
    const isoTimestamp = now.toISOString(); // Keep ISO format for file logs
    const readableTimestamp = formatDate(
      now,
      this.config.use24HourFormat,
      this.config.useRelativeTime
    );
    const timestamp = this.config.prettyPrint ? readableTimestamp : isoTimestamp;
    const colorizedTimestamp = this.config.colorize ? chalk.gray(timestamp) : timestamp;
    const colorizedLevel = this.config.colorize ? this.levelColors[level](level.toUpperCase()) : level.toUpperCase();
    const colorizedMessage = this.config.colorize ? chalk.whiteBright(message) : message;

    // Process context - handle errors specially
    let processedContext = { ...context };
    if (context.error instanceof Error) {
      processedContext = {
        ...processedContext,
        ...formatError(context.error, this.config)
      };
      delete processedContext.error;
    }

    // Construct console output
    let consoleOutput = `\n${icon}  ${colorizedLevel}  ${colorizedTimestamp}\n  ➤ ${colorizedMessage}`;
    if (Object.keys(processedContext).length) {
      for (const [key, value] of Object.entries(processedContext)) {
        const formattedValue = typeof value === 'object' && value !== null
          ? safeStringify(value)
          : String(value);
        const colorizedKey = this.config.colorize ? chalk.gray(key) : key;
        const colorizedValue = this.config.colorize ? chalk.cyan(formattedValue) : formattedValue;
        consoleOutput += `\n    • ${colorizedKey}: ${colorizedValue}`;
      }
    }
    const divider = this.config.colorize ? chalk.dim('\n────────────────────────────────────') : '\n────────────────────────────────────';
    consoleOutput += divider;

    // Output to console
    console.log(consoleOutput);

    // Write to log file if configured
    if (this.config.logToFile) {
      // Create a plain text version for the file - always use ISO format for machine readability
      let fileEntry = `[${isoTimestamp}] ${level.toUpperCase()}: ${message}`;
      if (Object.keys(processedContext).length) {
        fileEntry += ` | ${safeStringify(processedContext)}`;
      }
      this.writeToLogFile(fileEntry);
    }
  }

  // Convenience wrappers
  public debug(msg: string, ctx?: Record<string, any>): void {
    this.log('debug', msg, ctx);
  }
  public info(msg: string, ctx?: Record<string, any>): void {
    this.log('info', msg, ctx);
  }
  public warn(msg: string, ctx?: Record<string, any>): void {
    this.log('warn', msg, ctx);
  }
  public error(msg: string, ctx?: Record<string, any>): void {
    this.log('error', msg, ctx);
  }
  public fatal(msg: string, ctx?: Record<string, any>): void {
    this.log('fatal', msg, ctx);
  }

  /**
   * Logs an error object directly
   * @param msg Prefix message
   * @param error Error object
   * @param additionalContext Additional context (optional)
   */
  public logError(msg: string, error: Error, additionalContext: Record<string, any> = {}): void {
    this.log('error', msg, { ...additionalContext, error });
  }

  /**
   * Update the logger's configuration dynamically
   * @param options Partial configuration options to update
   */
  public configure(options: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...options };
    // Re-merge colors and icons in case they were updated
    this.levelColors = { ...DEFAULT_LEVEL_COLORS, ...(this.config.levelColors || {}) };
    this.levelIcons = { ...DEFAULT_LEVEL_ICONS, ...(this.config.levelIcons || {}) };

    // Ensure log directory exists if file logging was just enabled or path changed
    if (options.logToFile === true || (options.logFilePath && this.config.logToFile)) {
      try {
        ensureLogDirectoryExists(this.config.logFilePath);
      } catch (error: any) {
        console.error(`Failed to create log directory '${path.dirname(this.config.logFilePath)}': ${error.message}`);
        this.config.logToFile = false;
      }
    }
  }
}
