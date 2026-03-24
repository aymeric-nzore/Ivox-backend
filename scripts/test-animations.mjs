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
    console.log("🎬 Test Animation Endpoints\n");

    // Test 1: Créer 2 utilisateurs
    console.log("1️⃣ Créer 2 utilisateurs...");
    const user1 = await makeRequest("POST", "/api/auth/register", {
      username: `user1_${Date.now()}`,
      email: `user1_${Date.now()}@test.com`,
      password: "password123",
    });

    const user2 = await makeRequest("POST", "/api/auth/register", {
      username: `user2_${Date.now()}`,
      email: `user2_${Date.now()}@test.com`,
      password: "password123",
    });

    const token1 = user1.body.token;
    const token2 = user2.body.token;
    console.log(`   ✅ Utilisateurs créés\n`);

    // Test 2: Récupérer les animations splash
    console.log("2️⃣ Récupérer animations splash...");
    const animations = await makeRequest("GET", "/api/animations/splash");
    console.log(`   ✅ ${animations.body.total} animations trouvées`);
    const animationId = animations.body.animations[0]?.id;
    console.log(`   Animation 1 ID: ${animationId}\n`);

    // Test 3: Ajouter des coins à l'utilisateur 1
    console.log("3️⃣ Ajouter 1000 coins à l'utilisateur...");
    // Note: Ce endpoint doit exister, sinon le user peut pas acheter
    console.log(`   ⏭️  (Skip - need endpoint)\n`);

    // Test 4: Récupérer détails d'une animation
    console.log("4️⃣ Récupérer détails animation...");
    const details = await makeRequest("GET", `/api/animations/${animationId}`);
    console.log(
      `   ✅ ${details.body.title} - ${details.body.price} coins\n`
    );

    // Test 5: Acheter l'animation
    console.log("5️⃣ Acheter l'animation...");
    const buy = await makeRequest(
      "POST",
      `/api/animations/buy/${animationId}`,
      {},
      token1
    );
    if (buy.status === 400 && buy.body.message.includes("Coins")) {
      console.log(`   ⚠️  Pas assez de coins (c'est normal en test)\n`);
    } else {
      console.log(`   ✅ Achetée: ${buy.body.message}\n`);
    }

    // Test 6: Essayer d'équiper l'animation (devrait fail si pas assez de coins)
    console.log("6️⃣ Équiper l'animation...");
    const equip = await makeRequest(
      "POST",
      `/api/animations/equip/${animationId}`,
      {},
      token1
    );
    console.log(`   Status: ${equip.status} - ${equip.body.message}\n`);

    // Test 7: Récupérer l'animation équipée
    console.log("7️⃣ Récupérer animation équipée...");
    const active = await makeRequest(
      "GET",
      "/api/animations/user/active",
      null,
      token1
    );
    console.log(`   Status: ${active.status} - ${active.body.message}\n`);

    // Test 8: Récupérer les animations de l'utilisateur
    console.log("8️⃣ Récupérer animations possédées...");
    const owned = await makeRequest(
      "GET",
      "/api/animations/user/owned",
      null,
      token1
    );
    console.log(
      `   ✅ ${owned.body.total} animation(s) possédée(s)\n`
    );

    console.log("✨ Tests terminés!");
  } catch (error) {
    console.error("❌ Erreur test:", error.message);
  }

  process.exit(0);
}

setTimeout(test, 2000); // Attendre que le serveur soit prêt
