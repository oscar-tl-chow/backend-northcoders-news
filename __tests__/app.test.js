const request = require("supertest");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200 - responds with object containing all endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
        expect(typeof body.endpoints).toEqual("object");
      });
  });
});

describe("GET /api/topics", () => {
  test("200 - responds with object containing all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200 - responds with all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });
  test("articles date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("articles has no article body", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200 - responds with object with the input article id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("author");
        expect(body.article).toHaveProperty("title");
        expect(body.article).toHaveProperty("article_id");
        expect(body.article).toHaveProperty("body");
        expect(body.article).toHaveProperty("topic");
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("votes");
        expect(body.article).toHaveProperty("article_img_url");
      });
  });
  test("404 - responds with error message when that article does not exist", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no article found with ID 99999");
      });
  });
  test("400 - responds with error message when entered invalid ID", () => {
    return request(app)
      .get("/api/articles/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 - return all comments of article with the input article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
        expect(
          body.comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          })
        );
      });
  });
  test("200 - comments are ordered by descending dates", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
        expect(body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("404 - responds with an error message when article does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no comments in article found with ID 99999");
      });
  });
  test("400 - responds with error message when entered invalid ID", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  const articleId = 1;
  const testComment = { username: "butter_bridge", body: "test" };
  const testComment2 = {
    username: "butter_bridge",
    body: "test",
    extraBody: "extraTest",
  };
  test("201 - return posted comment", () => {
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.author).toEqual(testComment.username);
        expect(body.comment.body).toEqual(testComment.body);
        expect(body.comment.article_id).toEqual(articleId);
      });
  });
  test("201 - return posted comment, ignoring anything extra key value pair, in this case extraBody, extraTest", () => {
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(testComment2)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.author).toEqual(testComment.username);
        expect(body.comment.body).toEqual(testComment.body);
        expect(body.comment.article_id).toEqual(articleId);
      });
  });
  test("400 - responds with error message when body does not exist", () => {
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400 - responds with error message when only body is present without username", () => {
    const badRequestComment = { body: "bad request comment" };
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(badRequestComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400 - responds with error message when article id is invalid", () => {
    return request(app)
      .post(`/api/articles/one/comments`)
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("404 - responds with error message when username does not exist", () => {
    const noUserExistComment = { username: "unknownUser", body: "test" };
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(noUserExistComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no user exists");
      });
  });
  test("404 - responds with error message when article id does not exist", () => {
    return request(app)
      .post(`/api/articles/99999/comments`)
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no comments in article found with ID 99999");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  const testPatch = { inc_votes: 1 };
  const testPatchMinus = { inc_votes: -100 };
  const errorPatch = { inc_votes: "one" };
  const articleId1 = {
    article_id: 1,
    title: "Living in the shadow of a great man",
    topic: "mitch",
    author: "butter_bridge",
    body: "I find this existence challenging",
    created_at: 1594329060000,
    votes: 100,
    article_img_url:
      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  };
  test("200 - responds with updated article and new plus vote count", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(testPatch)
      .expect(200)
      .then(({ body }) => {
        const updatedVotes = body.article.votes;
        const expectedVotes = articleId1.votes + testPatch.inc_votes;
        expect(updatedVotes).toBe(expectedVotes);
      });
  });
  test("200 - responds with updated article and new minus vote count", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(testPatchMinus)
      .expect(200)
      .then(({ body }) => {
        const updatedVotes = body.article.votes;
        const expectedVotes = articleId1.votes + testPatchMinus.inc_votes;
        expect(updatedVotes).toBe(expectedVotes);
      });
  });
  test("400 - responds with error message when patch is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(errorPatch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400 - responds with error message when article id is invalid", () => {
    return request(app)
      .patch("/api/articles/one")
      .send(testPatch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400 - responds with error message when patch is empty", () => {
    return request(app)
      .patch("/api/articles/1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("404 - responds with error message when article id does not exist", () => {
    return request(app)
      .patch("/api/articles/99999")
      .send(testPatch)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no article found with ID 99999");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  const commentId = 1;
  test("204 - responds with empty string after deleting comment", () => {
    return request(app)
      .delete(`/api/comments/${commentId}`)
      .expect(204)
      .then(({ text }) => {
        expect(text).toBe("");
      });
  });
  test("400 - responds with error message when comment id is invalid", () => {
    return request(app)
      .delete("/api/comments/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("404 - responds with error message when comment id does not exist", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no comment found with ID 99999");
      });
  });
});

describe("GET /api/users", () => {
  test("200 - respond with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        expect(typeof body.users).toEqual("object");
        body.users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});
