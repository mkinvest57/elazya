// test-email.ts
import { sendWelcomeEmail } from "./src/lib/email"

async function main() {
    console.log("Sending test email...")
    const result = await sendWelcomeEmail("test@example.com", "Test User", "ELAZYA-TEST-KEY-1234")
    console.log("Result:", result)
}

main()
