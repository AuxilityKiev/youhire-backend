import "reflect-metadata"
import * as sinon from "sinon"
import * as request from "supertest"
import logger from "../../src/config/winston.user"
import SMSService from "../../src/services/api/sms/sms.service"
import { server, database, should, URL, MODELS, getToken } from "../index"

describe("Routes USERS", () => {
    let sendSMS: any
    let formatNumber: any
    before(async () => {
        await database.seed()
        formatNumber = sinon.stub(SMSService.prototype, "formatNumber").callsFake(item => item)
        sendSMS = sinon.stub(SMSService.prototype, "sendSMS").callsFake(() => logger.info("SMS was sent"))
    })
    after(() => {
        formatNumber.restore()
        sendSMS.restore()
    })
    describe("Users", () => {
        it("Get user by id: 1", done => {
            request(server)
                .get(`${URL.USERS}/1`)
                .expect(200)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    res.body.should.include.keys(MODELS.USER)
                    done()
                })
        })
        it("Get user by id: 2", done => {
            request(server)
                .get(`${URL.USERS}/2`)
                .expect(200)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    res.body.should.include.keys(MODELS.USER)
                    done()
                })
        })
    })
})
