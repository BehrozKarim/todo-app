import pino from "pino";
import PinoPretty from "pino-pretty";

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
}