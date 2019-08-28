import { getManager, Repository } from "typeorm"

import envConfig from "../../config/env.config"
import Host from "../entities/host"

export const seedHost = async (): Promise<void> => {
    const repository: Repository<Host> = getManager().getRepository(Host)
    if ((await repository.count()) === 0) {
        const host = new Host(`${envConfig.FILE_APP_HOST}:${envConfig.FILE_APP_PORT}`)
        await repository.save(host)
    }
}
