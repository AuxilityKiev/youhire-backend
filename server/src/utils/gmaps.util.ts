import Location from "../db/entities/location"
import logger from "../config/winston.user"

export default class GmapsUtil {
    public static getDistanceByCoordinates(location1: Location, location2: Location) {
        const earthRadius: number = 63.78137
        const deltaLat = this.radian(location1.latitude - location2.latitude)
        const deltaLong = this.radian(location1.longitude - location2.longitude)
        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(this.radian(location1.latitude)) *
                Math.cos(this.radian(location2.latitude) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2))
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        logger.info(`Distance: ${earthRadius * c}`)
        return earthRadius * c
    }

    private static radian(angle: number) {
        return (angle * Math.PI) / 180
    }
}
