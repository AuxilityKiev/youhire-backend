import { Middleware, KoaMiddlewareInterface } from "routing-controllers"
import logger from "../config/winston.user"
import { Context } from "koa"

@Middleware({ type: "before" })
export class LoggingMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<void>): Promise<void> {
        logger.info(`${context.method} ${context.url}`, {
            body: context.request.body,
            ip: context.ip
        })
        await next()
    }
}
