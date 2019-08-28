import "reflect-metadata"
import Container from "typedi"
import { useContainer, useKoaServer } from "routing-controllers"
import * as Koa from "koa"
import * as bodyParser from "koa-bodyparser"

import { authorizationChecker } from "./middlewares/authorizationChecker"
import { currentUserChecker } from "./middlewares/currentUserChecker"
import { LoggingMiddleware } from "./middlewares/logging.middleware"
import { AuthController } from "./services/api/auth/auth.controller"
import { UserController } from "./services/api/users/user.controller"
import { JobController } from "./services/api/job/job.controller"
import { CodeController } from "./services/api/code/code.controller"
import { PhoneNumberController } from "./services/api/phone-number/phone-number.controller"
import { CategoryController } from "./services/api/category/category.controller"
import { StripeController } from "./services/api/stripe/stripe.controller"
import { EarnerController } from "./services/api/earner/earner.controller"
import { SpenderController } from "./services/api/spender/spender.controller"
import { GenderController } from "./services/api/gender/gender.controller"
import { ImageController } from "./services/api/image/image.controller"
import { CertificateController } from "./services/api/certificate/certificate.controller"
import { PushController } from "./services/api/push/push.controller"
import { SubcategoryController } from "./services/api/subcategory/subcategory.controller"
import { GeneralController } from "./services/api/general/general.controller"
import logger from "./config/winston.user"
import envConfig from "./config/env.config"

const controllers = [
    GeneralController,
    AuthController,
    UserController,
    JobController,
    CodeController,
    PhoneNumberController,
    CategoryController,
    SubcategoryController,
    StripeController,
    EarnerController,
    SpenderController,
    GenderController,
    ImageController,
    CertificateController,
    PushController
]

logger.info(envConfig.API_VERSION)

useContainer(Container)

const koa = new Koa()

koa.use(bodyParser({ jsonLimit: "10mb" }))

export default useKoaServer(koa, {
    cors: true,
    controllers,
    authorizationChecker,
    currentUserChecker,
    middlewares: [LoggingMiddleware]
})
