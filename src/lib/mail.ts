import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const { error } = await resend.emails.send({
    from: "Praxis <noreply@m.meo0.com>",
    to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(error.message);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const resetUrl = `${baseUrl}/reset-password/${token}`;
  return sendMail({
    to,
    subject: "Praxis — パスワードリセット",
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:2rem;">
        <h2 style="color:#2563eb;">⚗️ Praxis</h2>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <p>以下のボタンから新しいパスワードを設定してください。<br/>（有効期限：1時間）</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:1.5rem 0;padding:.75rem 2rem;background:#2563eb;color:#fff;border-radius:.75rem;text-decoration:none;font-weight:bold;">
          パスワードをリセット
        </a>
        <p style="color:#6b7280;font-size:.875rem;">このメールに心当たりがない場合は無視してください。</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0;"/>
        <p style="color:#9ca3af;font-size:.75rem;">Praxis · Science into action.</p>
      </div>
    `,
  });
}
