import * as Stripe from "stripe"
import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import { NotFoundError } from "routing-controllers"

import envConfig from "../../../config/env.config"
import StripeAccount from "../../../db/entities/stripe-account"
import User from "../../../db/entities/user"
import UserRepository from "../users/user.repository"
import StripeRepository from "./stripe.repository"
import Card from "../../../db/entities/card"
import { PayoutRequest, Balance } from "./stripe.dto"
import { AuthUser } from "../../../common"
import { UserType } from "../../../common/enum"

@Service()
export default class StripeService {
    @InjectRepository()
    private readonly userRepository: UserRepository

    @InjectRepository()
    private readonly stripeRepository: StripeRepository

    private readonly stripeAPI = new Stripe(envConfig.STRIPE_API_KEY)

    /**
     * TODO remove before release
     */
    public async findAllAccounts(): Promise<StripeAccount[]> {
        return this.stripeRepository.find()
    }

    public async createCard(user: AuthUser, token: string, ip?: string): Promise<StripeAccount> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        let stripeAccount: StripeAccount = await this.extractStripeAccountFromUser(userData, user.type as UserType)
        if (!stripeAccount) {
            stripeAccount =
                user.type === UserType.SPENDER
                    ? await this.createStripeAccountForSpender(userData, token)
                    : await this.createStripeAccountForEarner(userData, token, ip)
        } else {
            await this.addCard(stripeAccount, user.type as UserType, token)
        }
        return stripeAccount
    }

    public async selectCard(user: AuthUser, cardToken: string): Promise<StripeAccount> {
        return user.type === UserType.EARNER
            ? this.selectCardAsEarner(user, cardToken)
            : this.selectCardAsSpender(user, cardToken)
    }

    public async createPayout(user: AuthUser, cardToken: string, request: PayoutRequest): Promise<{ message: string }> {
        const userData: User = await this.userRepository.findUserAsEarnerById(user.id)
        await this.stripeAPI.payouts.create(
            {
                amount: request.amount,
                currency: request.currency,
                destination: cardToken
            },
            {
                stripe_account: userData.earner.stripeAccount.accountId
            }
        )
        userData.earner.amount -= request.amount
        await this.userRepository.save(userData)
        return {
            message: "Payout was successfull"
        }
    }

    public async removeCard(user: AuthUser, cardId: string): Promise<StripeAccount> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        const stripeAccount: StripeAccount = await this.extractStripeAccountFromUser(userData, user.type as UserType)
        if (stripeAccount) {
            await this.stripeAPI.customers.deleteCard(stripeAccount.customerId, cardId)
        }
        userData[user.type].stripeAccount = await this.updateCards(stripeAccount, user.type as UserType)
        await this.userRepository.save(userData)
        return userData[user.type].stripeAccount
    }

    public async chargeCard(
        spenderData: User,
        earnerData: User,
        amount: number,
        fee: number
    ): Promise<{ message: string }> {
        const stripeAccount1: StripeAccount = await this.extractStripeAccountFromUser(spenderData, UserType.SPENDER)
        const stripeAccount2: StripeAccount = await this.extractStripeAccountFromUser(earnerData, UserType.EARNER)
        if (stripeAccount1 && stripeAccount2) {
            const selectCard: Card = stripeAccount1.cards.find(card => card.selected)
            if (selectCard) {
                await this.stripeAPI.charges.create({
                    amount,
                    currency: "usd",
                    description: "Example charge",
                    application_fee: fee,
                    customer: stripeAccount1.customerId,
                    destination: stripeAccount2.accountId
                })
            } else {
                throw new NotFoundError("No card was found for payment")
            }
        } else {
            throw new NotFoundError("Stripe account does not exist for current user")
        }
        return {
            message: "Payment was successful"
        }
    }

    public async getBalance(userData: User, type: UserType): Promise<Balance> {
        const stripeAccount: StripeAccount = await this.extractStripeAccountFromUser(userData, type)
        if (!stripeAccount) {
            throw new NotFoundError("Stripe account does not exist for current user")
        }
        const balance: Stripe.balance.IBalance = await this.stripeAPI.balance.retrieve({
            stripe_account: stripeAccount.accountId || stripeAccount.customerId
        })
        return {
            amount: balance.pending[0].amount,
            currency: balance.pending[0].currency
        }
    }

    private async createStripeAccountForEarner(user: User, token: string, ip: string): Promise<StripeAccount> {
        const stripeAccount = new StripeAccount()
        const account: Stripe.accounts.IAccount = await this.stripeAPI.accounts.create({
            email: user.email,
            type: "custom",
            country: "US",
            tos_acceptance: {
                ip,
                date: Math.floor(Date.now() / 1000)
            }
        })
        stripeAccount.accountId = account.id
        await this.stripeAPI.accounts.createExternalAccount(stripeAccount.accountId, {
            external_account: token,
            default_for_currency: true
        })
        await this.stripeRepository.save(stripeAccount)
        user.earner.stripeAccount = stripeAccount
        await this.userRepository.save(user)
        return this.updateCards(stripeAccount, UserType.EARNER)
    }

    private async createStripeAccountForSpender(user: User, token: string): Promise<StripeAccount> {
        const stripeAccount = new StripeAccount()
        const customer: Stripe.customers.ICustomer = await this.stripeAPI.customers.create({
            source: token,
            email: user.email
        })
        stripeAccount.customerId = customer.id
        await this.stripeRepository.save(stripeAccount)
        user.spender.stripeAccount = stripeAccount
        await this.userRepository.save(user)
        return this.updateCards(stripeAccount, UserType.SPENDER)
    }

    private async selectCardAsSpender(user: AuthUser, cardToken: string): Promise<StripeAccount> {
        const userData: User = await this.userRepository.findFullUserById(user.id, user.type as UserType)
        const stripeAccount: StripeAccount = await this.extractStripeAccountFromUser(userData, user.type as UserType)
        if (stripeAccount) {
            await this.stripeAPI.customers.update(stripeAccount.customerId, {
                default_source: cardToken
            })
            stripeAccount.cards = stripeAccount.cards.map(card => {
                card.selected = card.token === cardToken
                return card
            })
            await this.stripeRepository.save(stripeAccount)
        } else {
            throw new NotFoundError("Stripe account does not exist for current user")
        }
        return stripeAccount
    }

    private async selectCardAsEarner(user: AuthUser, cardToken: string): Promise<StripeAccount> {
        const userData: User = await this.userRepository.findUserAsEarnerById(user.id)
        const stripeAccount: StripeAccount = await this.extractStripeAccountFromUser(userData, user.type as UserType)
        if (stripeAccount) {
            stripeAccount.cards = stripeAccount.cards.map(card => {
                card.selected = card.token === cardToken
                return card
            })
            await this.stripeAPI.accounts.updateExternalAccount(stripeAccount.accountId, cardToken, {
                default_for_currency: true
            })
            await this.stripeRepository.save(stripeAccount)
        } else {
            throw new NotFoundError("Stripe account does not exist for current user")
        }
        return stripeAccount
    }

    private async addCard(stripeAccount: StripeAccount, type: UserType, token: string): Promise<StripeAccount> {
        const card =
            type === UserType.SPENDER
                ? await this.stripeAPI.customers.createSource(stripeAccount.customerId, {
                      source: token
                  })
                : await this.stripeAPI.accounts.createExternalAccount(stripeAccount.accountId, {
                      external_account: token,
                      default_for_currency: true
                  })
        return this.updateCards(stripeAccount, type, card.id)
    }

    private async updateCards(
        stripeAccount: StripeAccount,
        type: UserType,
        selectedCardId?: string
    ): Promise<StripeAccount> {
        stripeAccount.cards =
            type === UserType.SPENDER
                ? await this.getCardsFromSpender(stripeAccount.customerId)
                : await this.getCardsFromEarner(stripeAccount.accountId)
        if (selectedCardId) {
            for (const card of stripeAccount.cards) {
                if (card.token === selectedCardId) {
                    card.selected = true
                }
            }
        } else {
            stripeAccount.cards[0].selected = true
        }
        await this.stripeRepository.save(stripeAccount)
        return stripeAccount
    }

    private async getCardsFromSpender(customerId: string): Promise<Card[]> {
        return (await this.stripeAPI.customers.listCards(customerId)).data.map(cardDescriptor =>
            this.getCardFromStripePaymentCard(cardDescriptor)
        )
    }

    private async getCardsFromEarner(accountId: string): Promise<Card[]> {
        return (await this.stripeAPI.accounts.listExternalAccounts(accountId, {
            object: "card"
        })).data.map(cardDescriptor => this.getCardFromStripePaymentCard(cardDescriptor))
    }

    private async extractStripeAccountFromUser(user: User, type: UserType): Promise<StripeAccount> {
        return (await this.userRepository.findFullUserById(user.id, type))[type].stripeAccount
    }

    private getCardFromStripePaymentCard(cardDescriptor: Stripe.ICard): Card {
        const card = new Card()
        card.brand = cardDescriptor.brand
        card.last4 = cardDescriptor.last4
        card.expirationMonth = cardDescriptor.exp_month
        card.expirationYear = cardDescriptor.exp_year
        card.token = cardDescriptor.id
        return card
    }
}
