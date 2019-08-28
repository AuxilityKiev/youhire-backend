import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"

import CertificateRepository from "./certificate.repository"
import DTOUtil from "../../../utils/dto.util"
import { CertificateDTO } from "../../../common/dto"

@Service()
export default class CertificateService {
    @InjectRepository()
    private readonly repository: CertificateRepository

    public async getAllCertificates(): Promise<CertificateDTO[]> {
        return (await this.repository.findAllCertificates()).map(cert => DTOUtil.getCertificateDTO(cert))
    }
}
