import type { LogLevel, LogMessage } from "typeorm";
import { AbstractLogger as AbstractTypeormLogger } from "typeorm";
import type { Logger, LoggerOptions } from "winston";
import { createLogger, format, transports } from "winston";

import { crashServer } from "./index.js";

const loggerOptions: LoggerOptions = {
  level: "info",
  format: format.combine(format.splat(), format.timestamp(), format.json()),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new transports.File({ filename: "error.log", level: "error" }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new transports.File({ filename: "combined.log" }),
    // TODO: Add a transport for errors that are sent to the database for display in the admin panel
  ],
  exitOnError: false,
};

const logger = createLogger({
  ...loggerOptions,
  defaultMeta: { service: "danceblue-server" },
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.splat(),
        format.simple(),
        format.colorize()
      ),
    })
  );
}

/**
 * Log a debug message to the logger
 *
 * Use this log level for granular debug info such
 * as the contents of a variable or the result of
 * a function call.
 */
export const logDebug = logger.debug;

/**
 * Log an info message to the logger
 *
 * Use this log level for general, but not usually
 * useful information such as the successful completion
 * of an operation.
 */
export const logInfo = logger.info;

/**
 * Log a notice message to the logger
 *
 * Use this log level for unimportant, but potentially
 * useful information such as an unexpected, but handled
 * input or application state.
 */
export const logNotice = logger.notice;

/**
 * Log a warning message to the logger
 *
 * Use this log level for important, but not dangerous
 * information such as an unexpected, but handled error.
 *
 * The server should still provide a useful response to
 * the user at this log level, probably the one they were
 * expecting.
 *
 * This is the first level of log that should probably
 * never happen in a bug-free application.
 */
export const logWarning = logger.warning;

/**
 * Log an error message to the logger
 *
 * Use this log level for a failure that is not
 * immediately dangerous, to the application.
 *
 * The server should still provide a useful response to
 * the user at this log level, but probably not the one
 * they were expecting (i.e. unexplained 500 error)
 */
export const logError = logger.error;

/**
 * Log a critical message to the logger
 *
 * Use this log level for a failure that is
 * a serious problem, but not immediately fatal
 * to the application and is not likely to
 * immediately recur.
 *
 * The server's behavior is undefined at this point.
 */
export const logCritical = logger.crit;

/**
 * Log an alert message to the logger
 *
 * Use this log level for a failure that is
 * a SIGNIFICANT problem that needs an immediate
 * response.
 */
export const logAlert = logger.alert;

/**
 * Log an emergency message to the logger
 *
 * Use this log level for a failure that is
 * a SERIOUS problem and probably means
 * that the server is in an unrecoverable state
 */
export const logEmergency = logger.emerg;

/**
 * Log a fatal message to the logger
 *
 * Use this log level for a failure that is
 * a SERIOUS problem and probably means
 * that the server is in an unrecoverable state
 * when you want to stop anything else from
 * going wrong.
 *
 * WARNING: This will terminate the process
 * do not use this unless the server is in
 * an unrecoverable state
 *
 * @param content The content to log (will be coerced to a string)
 */
export function logFatal(content: unknown) {
  // Logs the error and then crashes the server
  logger.emerg(String(content), crashServer);
}

export class CustomTypeormLogger extends AbstractTypeormLogger {
  typeormLogger: Logger = createLogger({
    ...loggerOptions,
    defaultMeta: { service: "danceblue-server-database" },
  });

  /**
   * Write log to specific output.
   *
   * @param level Log level
   * @param logMessage Log message
   */
  protected writeLog(level: LogLevel, logMessage: LogMessage | LogMessage[]) {
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: true,
    });

    for (const message of messages) {
      switch (message.type ?? level) {
        case "log":
        case "schema":
        case "schema-build":
        case "migration": {
          this.typeormLogger.debug(message);
          break;
        }

        case "info":
        case "query": {
          this.typeormLogger.info(message);
          break;
        }

        case "warn":
        case "query-slow": {
          this.typeormLogger.warn(message);
          break;
        }

        case "error":
        case "query-error": {
          this.typeormLogger.error(message);
          break;
        }
      }
    }
  }
}

export default logger;
