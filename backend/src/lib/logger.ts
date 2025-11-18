// Centralized logging utility

export class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: Record<string, any>): void {
    console.log(
      JSON.stringify({
        level: 'info',
        context: this.context,
        message,
        ...meta,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    console.error(
      JSON.stringify({
        level: 'error',
        context: this.context,
        message,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
        ...meta,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(
      JSON.stringify({
        level: 'warn',
        context: this.context,
        message,
        ...meta,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          context: this.context,
          message,
          ...meta,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
