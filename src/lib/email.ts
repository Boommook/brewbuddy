import { Resend } from "resend";

let resend: Resend | undefined;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  resend ??= new Resend(apiKey);
  return resend;
}

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;

  await getResendClient().emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@brewbuddy.app",
    to,
    subject: "Verify your BrewBuddy email",
    html: `
      <h2>Welcome to BrewBuddy!</h2>
      <p>Click below to verify your email address. This link expires in 24 hours.</p>
      <a href="${link}">Verify Email</a>
    `,
  });
}