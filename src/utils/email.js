import nodemailer from "nodemailer";

async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
} = {}) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDEMAIL_USER,
      pass: process.env.SENDEMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let info = await transporter.sendMail({
    from: `"Dev Core" <${process.env.SENDEMAIL_USER}>`,
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });
  return info.rejected.length ? false : true;
}

export default sendEmail;
