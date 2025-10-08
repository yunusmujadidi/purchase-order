import { auth } from "./auth";

async function main() {
  console.log("🌱 Seeding database...");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = "admin";

  if (!email || !password) {
    throw new Error();
  }

  try {
    // Create superadmin using Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: "Superadmin",
        // Additional fields
        username: username,
        role: "SUPERADMIN",
        isActive: true,
      },
    });

    console.log("✅ Superadmin created:");
    console.log("   Email:", email);
    console.log("   Username:", username);
    console.log("   Password:", password);
    console.log("   Result:", result);
    console.log("");
    console.log("🎉 Seeding complete!");
  } catch (error: unknown) {
    const errorObj = error as { message?: string; body?: { message?: string } };
    if (
      errorObj.message?.includes("already exists") ||
      errorObj.body?.message?.includes("exists")
    ) {
      console.log("⚠️  Superadmin already exists");
      console.log("   Email:", email);
      console.log("   Username:", username);
      console.log("   Password:", password);
    } else {
      throw error;
    }
  }
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
