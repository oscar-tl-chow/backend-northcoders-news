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

describe('GET /api/articles/:article_id', () => {
	test("200 - responds with object with the input article id", () => {
		return request(app)
		.get('/api/articles/1')
		.expect(200)
		.then((response) => {
			expect(response.body.article).toHaveProperty("author")
			expect(response.body.article).toHaveProperty("title")
			expect(response.body.article).toHaveProperty("article_id")
			expect(response.body.article).toHaveProperty("body")
			expect(response.body.article).toHaveProperty("topic")
			expect(response.body.article).toHaveProperty("created_at")
			expect(response.body.article).toHaveProperty("votes")
			expect(response.body.article).toHaveProperty("article_img_url")
		})
	})
    test("404 - responds with error message when that article exist", () => {
        return request(app)
        .get("/api/articles/99999")
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe("no article found with ID 99999")
        })
    })
    test("400 - responds with error message when entered invalid ID", () => {
        return request(app)
        .get("/api/articles/one")
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe("bad request")
        })
    })
})

