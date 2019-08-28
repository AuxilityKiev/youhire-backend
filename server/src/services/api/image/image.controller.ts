import { Authorized, JsonController, CurrentUser, Body, Post, HttpCode, Param } from "routing-controllers"
import { Inject } from "typedi"

import ImageService from "./image.service"
import { ImageRequest, CertificateRequest } from "./image.dto"
import { AuthUser } from "../../../common"
import { UserDTO, JobDTO } from "../../../common/dto"
import { JobRequest } from "../job/job.dto"
import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/image`)
export class ImageController {
    @Inject()
    private readonly imageService: ImageService

    @Authorized()
    @HttpCode(201)
    @Post("/avatar")
    public async uploadImageAvatar(@CurrentUser() user: AuthUser, @Body() request: ImageRequest): Promise<UserDTO> {
        return this.imageService.uploadImageAsAvatar(user, request.base64)
    }

    @Authorized()
    @HttpCode(201)
    @Post("/certificate")
    public async uploadImageCertificate(
        @CurrentUser() user: AuthUser,
        @Body() request: CertificateRequest
    ): Promise<UserDTO> {
        return this.imageService.uploadImagesAsCertificate(user, request)
    }
}
