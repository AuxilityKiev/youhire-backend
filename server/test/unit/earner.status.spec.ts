import "reflect-metadata"
import * as sinon from "sinon"
import * as request from "supertest"
import logger from "../../src/config/winston.user"
import SMSService from "../../src/services/api/sms/sms.service"
import { server, database, should, URL, MODELS, getToken } from "../index"
import { UserType } from "../../src/common"

describe("Routes EARNER STATUS", () => {
    let sendSMS: any
    let formatNumber: any
    let user1: string
    before(async () => {
        await database.seed()
        user1 = await getToken("+380666666661")
        formatNumber = sinon.stub(SMSService.prototype, "formatNumber").callsFake(item => item)
        sendSMS = sinon.stub(SMSService.prototype, "sendSMS").callsFake(() => logger.info("SMS was sent"))
    })
    after(() => {
        formatNumber.restore()
        sendSMS.restore()
    })
    describe("Earner online status", () => {
        it("Get user info offline status", done => {
            request(server)
                .get(`${URL.PROFILE}`)
                .set("Authorization", "bearer " + user1)
                .expect(200)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    res.body.should.include.keys(MODELS.EARNER_PROFILE)
                    res.body.type.should.eql(UserType.EARNER)
                    res.body.online.should.eql(false)
                    done()
                })
        })
        it("Set offline status", done => {
            request(server)
                .post(`${URL.EARNER_STATUS}/offline`)
                .set("Authorization", "bearer " + user1)
                .expect(201)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    res.body.online.should.eql(false)
                    done()
                })
        })
        it("Set online status", done => {
            request(server)
                .post(`${URL.EARNER_STATUS}/online`)
                .set("Authorization", "bearer " + user1)
                .expect(201)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    console.log(res.body)
                    res.body.online.should.eql(true)
                    done()
                })
        })
        it("Get user info online status", done => {
            request(server)
                .get(`${URL.PROFILE}`)
                .set("Authorization", "bearer " + user1)
                .expect(200)
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    should.not.exist(err)
                    console.log(res.body)
                    res.body.should.include.keys(MODELS.EARNER_PROFILE)
                    res.body.type.should.eql(UserType.EARNER)
                    res.body.online.should.eql(true)
                    done()
                })
        })
    })
})
