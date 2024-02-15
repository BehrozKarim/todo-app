import pino from "pino";

export interface Logger {
    info: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
}

export class PinoLogger implements Logger {
    private readonly logger: pino.Logger;

    constructor() {
        this.logger = pino({
            transport: {
              target: "pino-pretty",
            },
          });
    }

    info(message: string): void {
        this.logger.info(message);
    }

    error(message: string): void {
        this.logger.error(message);
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

    async logRequest(req: any, res: any, next: any) {
        this.logger.info(`${req.method} ${req.path}`);
        next();
    }
}

const logger = new PinoLogger();
export default logger;