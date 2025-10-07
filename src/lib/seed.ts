import { auth } from "./auth";

async function main() {
  console.log("🌱 Seeding database...");

  const email = process.env.ADMIN_EMAIL || "yunusmujadidi@gmail.com";
  const password = "admin123";
  const username = "admin";

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
    console.log("");
    console.log("🎉 Seeding complete!");
  } catch (error: any) {
    if (
      error.message?.includes("already exists") ||
      error.body?.message?.includes("exists")
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
