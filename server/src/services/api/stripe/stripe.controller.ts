import { Authorized, Body, CurrentUser, Get, HttpCode, JsonController, Post, Param } from "routing-controllers"
import { Inject } from "typedi"

import StripeAccount from "../../../db/entities/stripe-account"
import { StripeRequest, PayoutRequest } from "./stripe.dto"
import StripeService from "./stripe.service"
import { AuthUser } from "../../../common"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/stripe`)
export class StripeController {
    @Inject()
    private readonly service: StripeService

    @Authorized()
    @HttpCode(201)
    @Post("/account/selectCard/:cardToken")
    public async selectCard(
        @Param("cardToken") cardToken: string,
        @CurrentUser({ required: true }) user: AuthUser
    ): Promise<StripeAccount> {
        return this.service.selectCard(user, cardToken)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/account/payout/:cardToken")
    public async createPayout(
        @Param("cardToken") cardToken: string,
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: PayoutRequest
    ): Promise<{ message: string }> {
        return this.service.createPayout(user, cardToken, request)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/account/createCard")
    public async addCardToCustomerAccount(
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: StripeRequest
    ): Promise<StripeAccount> {
        return this.service.createCard(user, request.token, request.ip)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/account/removeCard")
    public async removeCardFromCustomerAccount(
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: StripeRequest
    ): Promise<StripeAccount> {
        return this.service.removeCard(user, request.token)
    }

    /**
     * TODO remove before release
     */
    @HttpCode(200)
    @Get("/account")
    public async getAllAccounts(): Promise<StripeAccount[]> {
        return this.service.findAllAccounts()
    }
}
