import { createLogger, format, transports, config } from "winston";
import { DateTime } from "luxon";
const { combine, timestamp, printf, prettyPrint, colorize, align, label } =
  format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${level}] ${timestamp} - ${message}`;
});

/**
 * levels:
 * * emerg
 * * alert
 * * crit
 * * error
 * * warning
 * * notice
 * * info
 * * debug
 */
const logger = createLogger({
  format: combine(
    label({ label: "bot", message: true }),
    colorize(),
    align(),
    timestamp({ format: DateTime.now().toISOTime() }),
    prettyPrint(),
    logFormat,
  ),
  level: process.env["DEV"] ? "debug" : "info",
  transports: [new transports.Console()],
  levels: config.syslog.levels,
});

const errorLogging = (
  message: string,
  { reason, crit = false }: { reason?: any; crit?: boolean } = {},
) => {
  message = `*** ${message} ***`;
  if (reason) message += `\n${reason}\n*******************`;

  logger.log(crit ? "crit" : "error", message);
};

export { logger, errorLogging };
