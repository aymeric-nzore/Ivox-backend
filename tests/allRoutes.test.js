import express from "express";
import request from "supertest";

describe("All app routes smoke tests", () => {
  let app;

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-client-id";
    process.env.GOOGLE_SECRET_CLIENT =
      process.env.GOOGLE_SECRET_CLIENT || "test-client-secret";

    const { default: authRoutes } = await import("../routes/authRoutes.js");
    const { default: itemRoutes } = await import("../routes/itemRoutes.js");
    const { default: videoRoutes } = await import("../routes/videoRoutes.js");

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api/item", itemRoutes);
    app.use("/api/video", videoRoutes);
  });

  describe("Auth routes", () => {
    it("POST /api/auth/register should be wired", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "u", email: "u@test.com", password: "123456" });

      expect(response.status).not.toBe(404);
    });

    it("POST /api/auth/login should be wired", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "u@test.com", password: "123456" });

      expect(response.status).not.toBe(404);
    });

    it("DELETE /api/auth/deleteAccount should require auth", async () => {
      const response = await request(app).delete("/api/auth/deleteAccount");

      expect(response.status).toBe(401);
    });

    it("GET /api/auth/google/failure should return 401", async () => {
      const response = await request(app).get("/api/auth/google/failure");

      expect(response.status).toBe(401);
    });

    it("GET /api/auth/google should be wired", async () => {
      const response = await request(app).get("/api/auth/google");

      expect(response.status).not.toBe(404);
    });

    it("GET /api/auth/google/callback should be wired", async () => {
      const response = await request(app).get("/api/auth/google/callback");

      expect(response.status).not.toBe(404);
    });
  });

  describe("Item routes", () => {
    it("POST /api/item/upload should require auth", async () => {
      const response = await request(app)
        .post("/api/item/upload")
        .field("itemType", "song");

      expect(response.status).toBe(401);
    });

    it("POST /api/item/:id/buy should require auth", async () => {
      const response = await request(app).post("/api/item/123456789012/buy");

      expect(response.status).toBe(401);
    });

    it("GET /api/item should validate type", async () => {
      const response = await request(app).get("/api/item");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Type d'item invalide");
    });

    it("GET /api/item/:id should validate type", async () => {
      const response = await request(app).get("/api/item/123456789012");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Type d'item invalide");
    });

    it("DELETE /api/item/:id should validate type", async () => {
      const response = await request(app).delete("/api/item/123456789012");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Type d'item invalide");
    });
  });

  describe("Video routes", () => {
    it("POST /api/video/upload should require auth", async () => {
      const response = await request(app).post("/api/video/upload");

      expect(response.status).toBe(401);
    });

    it("POST /api/video/:id/like should require auth", async () => {
      const response = await request(app).post("/api/video/123456789012/like");

      expect(response.status).toBe(401);
    });

    it("POST /api/video/:id/play should require auth", async () => {
      const response = await request(app).post("/api/video/123456789012/play");

      expect(response.status).toBe(401);
    });

    it("GET /api/video should be wired", async () => {
      try {
        const response = await request(app)
          .get("/api/video")
          .timeout({ deadline: 1500 });

        expect(response.status).not.toBe(404);
      } catch (error) {
        expect(error).toHaveProperty("timeout");
      }
    });

    it("GET /api/video/:id should be wired", async () => {
      try {
        const response = await request(app)
          .get("/api/video/123456789012")
          .timeout({ deadline: 1500 });

        expect(response.status).not.toBe(404);
      } catch (error) {
        expect(error).toHaveProperty("timeout");
      }
    });

    it("DELETE /api/video/:id should require auth", async () => {
      const response = await request(app).delete("/api/video/123456789012");

      expect(response.status).toBe(401);
    });
  });
});
