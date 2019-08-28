import { EntityRepository, Repository } from "typeorm"

import Host from "../../../db/entities/host"

@EntityRepository(Host)
export default class HostRepository extends Repository<Host> {}
