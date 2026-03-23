import http from "http";

// Test forgotPassword endpoint
const testEmail = "test@example.com";

function makeRequest(method, path, body) {
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

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
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
    console.log("=== Testing Forgot Password OTP ===\n");

    // Test 1: Register a user
    console.log("1️⃣ Registering test user...");
    const registerRes = await makeRequest("POST", "/api/auth/register", {
      username: `testuser_${Date.now()}`,
      email: testEmail,
      password: "password123",
    });
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response: ${registerRes.body}\n`);

    // Test 2: Call forgotPassword
    console.log("2️⃣ Calling forgot password endpoint...");
    const resetRes = await makeRequest(
      "POST",
      "/api/auth/forgot-password",
      { email: testEmail }
    );
    console.log(`Status: ${resetRes.status}`);
    console.log(`Response: ${resetRes.body}\n`);

    if (resetRes.status !== 200) {
      console.log("❌ Error in forgot password");
      console.log("Check server logs for details");
    } else {
      console.log("✅ Forgot password request successful!");
      console.log("Check your email for the OTP code (check spam folder too)");
    }
  } catch (error) {
    console.error("Test error:", error.message);
  }

  process.exit(0);
}

test();
