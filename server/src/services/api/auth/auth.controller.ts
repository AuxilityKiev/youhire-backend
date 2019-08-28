import { Authorized, Body, CurrentUser, Get, HttpCode, JsonController, Param, Post, Put } from "routing-controllers"
import { Inject } from "typedi"

import AuthService from "./auth.service"
import { SignInConfirmRequest, SignInRequest, ProfileRequest, Profile } from "./auth.dto"
import { AuthUser } from "../../../common"
import { UserDTO } from "../../../common/dto"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/auth`)
export class AuthController {
    @Inject()
    private readonly authService: AuthService

    @HttpCode(201)
    @Post("/send")
    public async sendMessage(@Body() request: SignInRequest): Promise<{ message: string }> {
        return this.authService.send(request)
    }

    @HttpCode(201)
    @Post("/send/test")
    public async sendMessageTest(@Body() request: SignInRequest): Promise<{ message: string }> {
        return this.authService.sendTest(request)
    }

    @HttpCode(201)
    @Post(`/earner`)
    public async verifyConfirmationCodeEarner(@Body() request: SignInConfirmRequest): Promise<Profile> {
        return this.authService.confirm(request, "earner")
    }

    @HttpCode(201)
    @Post(`/spender`)
    public async verifyConfirmationCodeSpender(@Body() request: SignInConfirmRequest): Promise<Profile> {
        return this.authService.confirm(request, "spender")
    }

    @Authorized()
    @HttpCode(200)
    @Put("/profile")
    public async fillUserProfile(
        @Body() request: ProfileRequest,
        @CurrentUser({ required: true }) user: AuthUser
    ): Promise<UserDTO> {
        return this.authService.fillUser(request, user)
    }

    @Authorized()
    @HttpCode(200)
    @Get("/profile")
    public async getProfile(@CurrentUser({ required: true }) user: AuthUser): Promise<UserDTO> {
        return this.authService.getUserProfile(user)
    }

    @Authorized()
    @HttpCode(200)
    @Put("/notifications/:enabled")
    public async switchNotifications(
        @Param("enabled") enabled: boolean,
        @CurrentUser({ required: true }) user: AuthUser,
        @Body() request: { firebaseToken: string }
    ): Promise<UserDTO> {
        return this.authService.switchNotifications(enabled, user, request)
    }

    @Authorized()
    @HttpCode(200)
    @Put("/status/:status")
    public async setOnlineStatus(
        @Param("status") status: boolean,
        @CurrentUser({ required: true }) user: AuthUser
    ): Promise<UserDTO> {
        return this.authService.setOnlineStatus(status, user)
    }
}
