import { EntityRepository, Repository } from "typeorm"

import Certificate from "../../../db/entities/certificate"
import Earner from "../../../db/entities/earner"

@EntityRepository(Certificate)
export default class CertificateRepository extends Repository<Certificate> {
    public async findAllCertificates(): Promise<Certificate[]> {
        return this.find()
    }

    public findAllCertificatesByEarner(earner: Earner): Promise<Certificate[]> {
        return this.find({ earner })
    }
}
