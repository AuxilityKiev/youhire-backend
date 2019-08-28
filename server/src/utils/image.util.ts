import Image from "../db/entities/image"

export default class ImageUtil {
    public static getImageUrl(image: Image) {
        return `${image.host.name}/api/images/${image.token}`
    }
}
