type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    };
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const logMessage = this.formatMessage(level, message, meta);
    const output = JSON.stringify(logMessage);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(output);
        }
        break;
      default:
        console.log(output);
    }
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log('debug', message, meta);
  }
}

export default new Logger();
