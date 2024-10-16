const request = require("supertest")
const app = require("../app.js")
const seed = require("../db/seeds/seed.js")
const db = require("../db/connection.js")
const testData = require("../db/data/test-data/index.js")
const endpoints = require("../endpoints.json")
require('jest-sorted')

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
        .then(({ body }) => {
            expect(body.topics.length).toBe(3)
            body.topics.forEach((topic) => {
                expect(topic).toHaveProperty("slug")
                expect(topic).toHaveProperty("description")
            })
        })
    })
})

describe('GET /api/articles', () => {
    test("200 - responds with all articles", () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(13)
            body.articles.forEach((article) => {
                expect(article).toHaveProperty("author")
                expect(article).toHaveProperty("title")
                expect(article).toHaveProperty("article_id")
                expect(article).toHaveProperty("topic")
                expect(article).toHaveProperty("created_at")
                expect(article).toHaveProperty("votes")
                expect(article).toHaveProperty("article_img_url")
                expect(article).toHaveProperty("comment_count")
            })
        })
    })
    test("articles date in descending order", () => {
        return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(13)
            expect(body.articles).toBeSortedBy("created_at", {
                descending: true
            })
        })
    })
    test("articles has no article body", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                body.articles.forEach((article) => {
                    expect(article).not.toHaveProperty("body")
                })
            })
    })
})

describe('GET /api/articles/:article_id', () => {
	test("200 - responds with object with the input article id", () => {
		return request(app)
		.get('/api/articles/1')
		.expect(200)
		.then(({ body }) => {
			expect(body.article).toHaveProperty("author")
			expect(body.article).toHaveProperty("title")
			expect(body.article).toHaveProperty("article_id")
			expect(body.article).toHaveProperty("body")
			expect(body.article).toHaveProperty("topic")
			expect(body.article).toHaveProperty("created_at")
			expect(body.article).toHaveProperty("votes")
			expect(body.article).toHaveProperty("article_img_url")
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

