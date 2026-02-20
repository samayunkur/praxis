import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mail1005.onamae.ne.jp",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },
});

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
  return transporter.sendMail({
    from: `"Praxis" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
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
