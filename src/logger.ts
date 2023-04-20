import type { LogLevel, LogMessage } from "typeorm";
import { AbstractLogger as AbstractTypeormLogger } from "typeorm";
import type { Logger, LoggerOptions } from "winston";
import { createLogger, format, transports } from "winston";

import { stopServer } from "./index.js";

const fileErrorLogTransport = new transports.File({
  filename: "error.log",
  level: "error",
});

const fileLogTransport = new transports.File({
  filename: "combined.log",
  maxsize: 1_000_000,
  maxFiles: 3,
});

const loggerOptions = {
  level: "debug",
  format: format.combine(format.splat(), format.timestamp(), format.json()),
  transports: [
    fileErrorLogTransport,
    fileLogTransport,
    // TODO: Add a transport for errors that are sent to the database for display in the admin panel
  ],
  exitOnError: false,
} satisfies LoggerOptions;

const logger = createLogger({
  ...loggerOptions,
  defaultMeta: { service: "danceblue-server" },
});

const consoleTransport = new transports.Console({
  format: format.combine(format.splat(), format.simple(), format.colorize()),
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(consoleTransport);
}

logger.info("Logger initialized");

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
  logger.emerg(String(content), stopServer);
}

const databaseLogTransport = new transports.File({
  filename: "database.log",
  maxsize: 1_000_000,
  maxFiles: 3,
});

const typeormLogLevels = {
  "base": 9, // Actually "log"
  "schema": 8,
  "schema-build": 7,
  "migration": 6,
  "query": 5,
  "info": 4,
  "warn": 3,
  "query-slow": 2,
  "error": 1,
  "query-error": 0,
} satisfies LoggerOptions["levels"];

export class CustomTypeormLogger extends AbstractTypeormLogger {
  typeormLogger: Logger;

  constructor() {
    super();
    this.typeormLogger = createLogger({
      ...loggerOptions,
      level: "base",
      levels: typeormLogLevels,
      defaultMeta: { service: "danceblue-server-database" },
      transports: [databaseLogTransport],
      format: format.combine(
        format.simple(),
        format.timestamp(),
        format.printf((info) => {
          const { timestamp, level, ...args } = info;

          const messageStart = `${timestamp as string} ${level}: `.padEnd(40);

          let messagePrefix = "";
          let messageContent = "[NO MESSAGE]";
          let messageAdditionalInfo = "";

          const rawMessage = args as Partial<LogMessage>;
          if (rawMessage.prefix)
            messagePrefix = `${String(rawMessage.prefix).trim()} `;
          if (rawMessage.message)
            messageContent = String(rawMessage.message).trim();
          if (rawMessage.additionalInfo)
            messageAdditionalInfo = ` ${JSON.stringify(
              rawMessage.additionalInfo
            )}`;

          return (
            messageStart +
            messagePrefix +
            messageContent +
            messageAdditionalInfo
          );
        })
      ),
    });

    this.typeormLogger.info({
      prefix: "logger:",
      message: "TypeORM logger initialized",
    });

    process.on("exit", () => {
      this.typeormLogger.info({
        prefix: "logger:",
        message: "TypeORM logger closing",
      });
      this.typeormLogger.close();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected isLogEnabledFor(): boolean {
    return true;
  }

  /**
   * Write log to specific output.
   *
   * @param level Log level
   * @param logMessage Log message
   */
  protected writeLog(level: LogLevel, logMessage: LogMessage | LogMessage[]) {
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: false,
    });

    // File logger (all levels)
    for (const message of messages) {
      const messageLevel = message.type ?? level;
      if (messageLevel === "log") {
        this.typeormLogger.log("base", message);
      } else {
        this.typeormLogger.log(messageLevel, message);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const highlightedMessages = this.prepareLogMessages(logMessage, {
        highlightSql: true,
      });
      // Main logger (only warn and error)
      for (const message of highlightedMessages) {
        switch (message.type ?? level) {
          case "warn":
          case "query-slow": {
            logger.warn(message);
            break;
          }

          case "error":
          case "query-error": {
            logger.error(message);
            break;
          }
        }
      }
    }
  }
}

export default logger;
