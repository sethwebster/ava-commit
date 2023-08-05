// A configurable logger for the application
// ---------------------------------------------------------------

interface ILogger {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
}

export default class Logger {
  private static _logger: ILogger = console;
  private static _verbose: boolean = false;
  public static log(...args: any[]): void {
    Logger._logger.log(...args);
  }

  public static error(...args: any[]): void {
    Logger._logger.error(...args);
  }

  public static warn(...args: any[]): void {
    Logger._logger.warn(...args);
  }

  public static info(...args: any[]): void {
    Logger._logger.info(...args);
  }

  public static debug(...args: any[]): void {
    Logger._logger.debug(...args);
  }

  public static verbose(...args: any[]): void {
    if (!Logger._verbose) return;
    Logger._logger.log(...args);
  }

  public static setVerbose(verbose: boolean): void {    
    Logger._verbose = verbose;
  }

  public static setLogger(logger: any): void {
    Logger._logger = logger;
  }
}