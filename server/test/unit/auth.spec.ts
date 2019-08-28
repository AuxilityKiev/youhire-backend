import * as sinon from "sinon"
import * as request from "supertest"
import logger from "../../src/config/winston.user"
import SMSService from "../../src/services/api/sms/sms.service"
import { server, database, URL, should, MODELS } from "../index"

describe("Authentication", () => {
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
    describe("Unregistered users", () => {
        it("Send message with code", done => {
            request(server)
                .post(URL.SEND)
                .send({
                    phoneNumber: "+380666666663"
                })
                .expect(201)
                .expect("Content-Type", /json/)
                .expect(res => res.body.message === "SMS was sent successfully")
                .end((err, res) => {
                    should.not.exist(err)
                    done()
                })
        })
        it("Send message with code to invalid number", done => {
            request(server)
                .post(URL.SEND)
                .send({
                    phoneNumber: "+380666666663"
                })
                .expect(201)
                .expect(res => res.body.message === "SMS was sent successfully")
                .end((err, res) => {
                    should.not.exist(err)
                    done()
                })
        })
        it("Confirm with error code", done => {
            request(server)
                .post(`${URL.CONFIRM}/earner`)
                .send({
                    phoneNumber: "+380666666663",
                    code: "12345"
                })
                .expect(403)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with valid code", done => {
            request(server)
                .post(`${URL.CONFIRM}/earner`)
                .send({
                    phoneNumber: "+380666666663",
                    code: "000003"
                })
                .expect(201)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with invalid code", done => {
            request(server)
                .post(`${URL.CONFIRM}/earner`)
                .send({
                    phoneNumber: "+380666666663",
                    code: "000002"
                })
                .expect(403)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with invalid phonenumber", done => {
            request(server)
                .post(`${URL.CONFIRM}/earner`)
                .send({
                    phoneNumber: "+380666666613",
                    code: "000002"
                })
                .expect(402)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with spender role", done => {
            request(server)
                .post(`${URL.CONFIRM}/spender`)
                .send({
                    phoneNumber: "+380666666664",
                    code: "000004"
                })
                .expect(201)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with invalid role", done => {
            request(server)
                .post(`${URL.CONFIRM}/user`)
                .send({
                    phoneNumber: "+380666666664",
                    code: "000004"
                })
                .expect(404)
                .expect("Content-Type", /json/, done)
        })
        it("Confirm with repeated code", done => {
            request(server)
                .post(`${URL.CONFIRM}/earner`)
                .send({
                    phoneNumber: "+380666666663",
                    code: "000003"
                })
                .expect(403)
                .expect("Content-Type", /json/, done)
        })
    })
})
