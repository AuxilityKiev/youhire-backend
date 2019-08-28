import { JsonController, Get, HttpCode } from "routing-controllers"
import { Inject } from "typedi"

import CertificateService from "./certificate.service"
import { CertificateDTO } from "../../../common/dto"

import envConfig from "../../../config/env.config"

@JsonController(`${envConfig.BASE_URL}/certificate`)
export class CertificateController {
    @Inject()
    private readonly certificateService: CertificateService

    @Get()
    @HttpCode(200)
    public async getAllCertificates(): Promise<CertificateDTO[]> {
        return this.certificateService.getAllCertificates()
    }
}
