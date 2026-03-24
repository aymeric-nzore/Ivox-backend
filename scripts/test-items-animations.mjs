import http from "http";

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            body: parsed,
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  try {
    console.log("🎬 Test Animations comme Items\n");

    // Test 1: Créer user
    console.log("1️⃣ Créer utilisateur...");
    const userRes = await makeRequest("POST", "/api/auth/register", {
      username: `animuser_${Date.now()}`,
      email: `animuser_${Date.now()}@test.com`,
      password: "password123",
    });

    const token = userRes.body.token;
    const userId = userRes.body.userId;
    console.log(`   ✅ Utilisateur créé: ${userId}\n`);

    // Test 2: Récupérer les animations (comme items)
    console.log("2️⃣ Récupérer animations (itemType=animation)...");
    const animations = await makeRequest(
      "GET",
      "/api/shopItem?itemType=animation",
      null,
      token
    );
    console.log(`   ✅ ${animations.body.length} animations trouvées`);
    const animationId = animations.body[0]?._id;
    console.log(`   Animation: ${animations.body[0]?.title}\n`);

    // Test 3: Acheter l'animation
    console.log("3️⃣ Acheter l'animation...");
    const buyRes = await makeRequest(
      "POST",
      `/api/shopItem/${animationId}/buy`,
      { type: "animation" },
      token
    );
    console.log(`   Status: ${buyRes.status}`);
    if (buyRes.status === 200) {
      console.log(`   ✅ ${buyRes.body.message}\n`);
    } else {
      console.log(`   ⚠️  ${buyRes.body.message}\n`);
    }

    // Test 4: Équiper l'animation
    console.log("4️⃣ Équiper l'animation...");
    const equipRes = await makeRequest(
      "POST",
      `/api/shopItem/animation/equip`,
      { animationId },
      token
    );
    console.log(`   Status: ${equipRes.status}`);
    console.log(`   ${equipRes.body.message}\n`);

    // Test 5: Récupérer l'animation équipée
    console.log("5️⃣ Récupérer animation équipée...");
    const activeRes = await makeRequest(
      "GET",
      "/api/shopItem/animation/active",
      null,
      token
    );
    console.log(`   Status: ${activeRes.status}`);
    if (activeRes.body.animation) {
      console.log(`   ✅ Animation active: ${activeRes.body.animation.title}\n`);
    } else {
      console.log(`   ${activeRes.body.message}\n`);
    }

    // Test 6: Récupérer animations possédées
    console.log("6️⃣ Récupérer animations possédées...");
    const ownedRes = await makeRequest(
      "GET",
      "/api/shopItem/animation/owned",
      null,
      token
    );
    console.log(
      `   ✅ ${ownedRes.body.total} animation(s) possédée(s)\n`
    );

    console.log("✨ Tests terminés!");
  } catch (error) {
    console.error("❌ Erreur test:", error.message);
  }

  process.exit(0);
}

setTimeout(test, 2000);
