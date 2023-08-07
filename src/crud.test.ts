import request from "supertest";
import app from "./index";
import http from "http";

let server: http.Server;

beforeAll((done) => {
  const port = 3081;
  server = app.listen(port, () => {
    console.log(`Test server is running on port ${port}`);
    done();
  });
});

afterAll((done) => {
  server.close(async () => {
    console.log("Test server is closed.");
    done();
  });
});

describe("POST /:collection", () => {
  it("should create a new record in the collection", async () => {
    const newRecord = {
      name: "Manidhar",
      address: "california",
      PhoneNumber: "132413242",
    };
    const response = await request(app).post(`/Table1`).send(newRecord);
    expect(response.status).toBe(200);
  });

  it("checking if error is present if table doesn't exists", async () => {
    const newRecord = {
      name: "Manidhar",
      address: "california",
      phoneNumber : "242423",
    };
    const response = await request(app).post(`/Table111`).send(newRecord);
    expect(response.status).toBe(200);
  });
});

describe("post /:collection/:id", () => {
  it("getting a record in the collection", async () => {
    const newRecord = {
      name: "Manidhar",
      address: "california",
      PhoneNumber: 132413242,
    };
    const response = await request(app).put(`/Table1/1`).send(newRecord);
    expect(response.status).toBe(200);
  });
  it("wrong table name in the collection", async () => {
    const response = await request(app).put(`/Table100/1`);
    expect(response.status).toBe(500);
  });

  it("wrong id name in the collection", async () => {
    const response = await request(app).put(`/Table1/1`).send({
      name: "Manidhar",
      address: "california",
      PhoneNumber: "132413242",
    });
    expect(response.status).toBe(200);
  });
});

describe("get /:collection/:id", () => {
  it("getting a record in the collection", async () => {
    const response = await request(app).get(`/Table1/1`);
    expect(response.status).toBe(200);
  });
  it("wrong table name in the collection", async () => {
    const response = await request(app).get(`/Table100/1`);
    expect(response.status).toBe(500);
  });

  it("wrong id name in the collection", async () => {
    const response = await request(app).get(`/Table1/1323`);
    expect(response.status).toBe(500);
  });
});

describe("delete /:collection/:id", () => {
  it("deleting a record in the collection", async () => {
    const response = await request(app).delete(`/Table1/1`);
    expect(response.status).toBe(200);
  });
  it("wrong table name in the collection", async () => {
    const response = await request(app).delete(`/Table100/1`);
    expect(response.status).toBe(500);
  });
});
