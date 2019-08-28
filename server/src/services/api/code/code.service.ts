import { Service } from "typedi"
import { InjectRepository } from "typeorm-typedi-extensions"
import CodeRepository from "./code.repository"

@Service()
export default class CodeService {
    @InjectRepository()
    private readonly repository: CodeRepository

    /**
     * TODO remove before release
     */
    public async getAllCodesWithPhoneNumber() {
        return this.repository.getCodesByPhoneNumber()
    }
}
