const request = require("supertest")
const app = require("../app.js")
const seed = require("../db/seeds/seed.js")
const db = require("../db/connection.js")
const testData = require("../db/data/test-data/index.js")
const endpoints = require("../endpoints.json")

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api', () => {
    test("responds with object containing all endpoints", () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body.endpoints).toEqual(endpoints)
            expect(typeof body.endpoints).toEqual("object")
        })
    })
})

describe('GET /api/topics', () => {
    test("200 - responds with object containing all topics", () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            expect(response.body.topics.length).toBe(3)
            response.body.topics.forEach((topic) => {
                expect(topic).toHaveProperty("slug")
                expect(topic).toHaveProperty("description")
            })
        })
    })
})