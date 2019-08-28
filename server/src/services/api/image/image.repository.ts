import { EntityRepository, Repository } from "typeorm"

import Image from "../../../db/entities/image"

@EntityRepository(Image)
export default class ImageRepository extends Repository<Image> {}
