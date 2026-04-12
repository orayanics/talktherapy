import nodemailer from "nodemailer";
import { isProduction } from "@/constant";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
};

let transporter: nodemailer.Transporter | null = null;

const getRequired = (key: string) => process.env[key]?.trim();
const getSmtpPassword = () =>
  getRequired("SMTP_PASS") || getRequired("SMTP_PASSWORD");
const getSmtpFrom = () => getRequired("SMTP_FROM") || getRequired("SMTP_USER");

const hasSmtpConfig = () =>
  Boolean(
    getRequired("SMTP_HOST") &&
    getRequired("SMTP_PORT") &&
    getRequired("SMTP_USER") &&
    getSmtpPassword() &&
    getSmtpFrom(),
  );

function getTransporter() {
  if (transporter) return transporter;

  const host = getRequired("SMTP_HOST");
  const port = getRequired("SMTP_PORT");
  const user = getRequired("SMTP_USER");
  const pass = getSmtpPassword();

  if (!host || !port || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendMail(input: SendMailInput) {
  const from = getSmtpFrom();
  const transport = getTransporter();

  if (!from || !transport) {
    const warning =
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS or SMTP_PASSWORD. Optional: SMTP_FROM (defaults to SMTP_USER).";
    if (isProduction) throw new Error(warning);

    console.warn(`[mail] ${warning}`);
    console.info(
      `[mail] dev fallback -> to=${input.to} subject=${input.subject} body=${input.text}`,
    );
    return;
  }

  await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

export async function sendVerificationOtpEmail(params: {
  email: string;
  otp: string;
}) {
  await sendMail({
    to: params.email,
    subject: "Your TalkTherapy verification code",
    text: `Your verification code is ${params.otp}. This code expires in 10 minutes.`,
  });
}

export async function sendVerificationLinkEmail(params: {
  email: string;
  url: string;
}) {
  await sendMail({
    to: params.email,
    subject: "Verify your TalkTherapy email",
    text: `Verify your email address by opening this link: ${params.url}`,
  });
}

export async function sendResetPasswordEmail(params: {
  email: string;
  url: string;
}) {
  await sendMail({
    to: params.email,
    subject: "Reset your TalkTherapy password",
    text: `Reset your password by opening this link: ${params.url}`,
  });
}

export const mailConfig = {
  hasSmtpConfig,
} as const;
