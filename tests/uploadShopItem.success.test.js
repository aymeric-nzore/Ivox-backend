import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import cloudinary from "../config/cloudinary.js";
import Song from "../models/song.js";
import Animation from "../models/animation.js";
import Avatar from "../models/avatarItem.js";
import { uploadShopItem } from "../controllers/ItemController.js";

describe("uploadShopItem success cases", () => {
  let req;
  let res;
  let io;

  beforeEach(() => {
    jest.clearAllMocks();

    io = { emit: jest.fn() };

    req = {
      body: {
        title: "My item",
        description: "desc",
        duration: 12,
        price: 100,
        itemType: "song",
        categorie: "song_moderne",
        gender: "unisex",
        format: "gif",
      },
      file: { path: "uploads/items/test.bin" },
      query: {},
      app: {
        get: jest.fn().mockReturnValue(io),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest
      .spyOn(cloudinary.uploader, "upload")
      .mockResolvedValue({ secure_url: "https://cdn/item", public_id: "pub123" });

    jest.spyOn(Song, "create").mockResolvedValue({ _id: "song1", itemType: "song" });
    jest
      .spyOn(Animation, "create")
      .mockResolvedValue({ _id: "ani1", itemType: "animation" });
    jest.spyOn(Avatar, "create").mockResolvedValue({ _id: "ava1", itemType: "avatar" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a song when itemType is song", async () => {
    req.body.itemType = "song";
    req.body.categorie = "song_moderne";

    await uploadShopItem(req, res);

    expect(Song.create).toHaveBeenCalledTimes(1);
    expect(Animation.create).not.toHaveBeenCalled();
    expect(Avatar.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(io.emit).toHaveBeenCalledWith(
      "new_item",
      expect.objectContaining({ item: expect.any(Object) }),
    );
  });

  it("creates an animation when itemType is animation", async () => {
    req.body.itemType = "animation";
    req.body.categorie = "ani_quizz";

    await uploadShopItem(req, res);

    expect(Animation.create).toHaveBeenCalledTimes(1);
    expect(Song.create).not.toHaveBeenCalled();
    expect(Avatar.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("creates an avatar when itemType is avatar", async () => {
    req.body.itemType = "avatar";
    req.body.categorie = "avat_hair";
    req.body.gender = "unisex";

    await uploadShopItem(req, res);

    expect(Avatar.create).toHaveBeenCalledTimes(1);
    expect(Song.create).not.toHaveBeenCalled();
    expect(Animation.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
