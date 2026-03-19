import express from "express";
import request from "supertest";
import itemRoutes from "../routes/itemRoutes.js";

describe("Item routes", () => {
  const app = express();

  app.use(express.json());
  app.use("/api/item", itemRoutes);

  it("GET /api/item without itemType returns 400", async () => {
    const response = await request(app).get("/api/item");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Type d'item invalide");
  });

  it("GET /api/item/:id without itemType returns 400", async () => {
    const response = await request(app).get("/api/item/123456789012");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Type d'item invalide");
  });

  it("DELETE /api/item/:id without type returns 400", async () => {
    const response = await request(app).delete("/api/item/123456789012");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Type d'item invalide");
  });

  it("GET /api/item with invalid type returns 400", async () => {
    const response = await request(app).get("/api/item?type=invalid");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Type d'item invalide");
  });

  it("GET /api/item/:id with invalid type returns 400", async () => {
    const response = await request(app).get("/api/item/123456789012?type=invalid");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Type d'item invalide");
  });
});
