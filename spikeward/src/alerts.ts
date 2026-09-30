import type { Env } from "./env";
import { sign } from "./crypto";
import { getMeta } from "./db";
import type { Settings } from "./settings";

export interface Alert {
  subject: string;
  text: string;
}

export interface AlertResult {
  webhook: "sent" | "off" | string;
  email: "sent" | "off" | string;
}

/**
 * Sends an alert to every configured channel: a Slack- or Discord-compatible webhook, and
 * email through Cloudflare Email Routing. Failures are reported, never thrown, so alerts
 * can't break the loop.
 */
export async function sendAlert(env: Env, settings: Settings, alert: Alert): Promise<AlertResult> {
  const [webhook, email] = await Promise.all([sendWebhook(settings, alert), sendEmail(env, settings, alert)]);
  if (webhook !== "sent" && webhook !== "off") console.error("webhook alert failed:", webhook);
  if (email !== "sent" && email !== "off") console.error("email alert failed:", email);
  return { webhook, email };
}

async function sendWebhook(settings: Settings, alert: Alert): Promise<string> {
  const url = settings.alerts.webhookUrl;
  if (!url) return "off";
  const text = `*${alert.subject}*\n${alert.text}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, content: text.slice(0, 1900) }),
    });
    return res.ok ? "sent" : `The webhook answered HTTP ${res.status}.`;
  } catch (e) {
    return `The webhook couldn't be reached: ${(e as Error).message}`;
  }
}

async function sendEmail(env: Env, settings: Settings, alert: Alert): Promise<string> {
  const { emailTo, emailFrom } = settings.alerts;
  if (!emailTo) return "off";
  if (!emailFrom) return "Set a From address on a domain with Email Routing turned on.";
  if (!env.EMAIL) return "This install has no EMAIL binding. Sync your fork with the latest Spikeward and redeploy.";
  try {
    await env.EMAIL.send({
      from: { email: emailFrom, name: "Spikeward" },
      to: emailTo,
      subject: alert.subject,
      text: alert.text,
      html: toHtml(alert),
    });
    return "sent";
  } catch (e) {
    const msg = (e as Error).message;
    if (/verif|destination/i.test(msg)) {
      return `Cloudflare refused to send to ${emailTo}: it must be a verified destination address in Email Routing. (${msg})`;
    }
    if (/sender|from|domain/i.test(msg)) {
      return `Cloudflare refused the From address ${emailFrom}: it must be on a domain in this account with Email Routing turned on. (${msg})`;
    }
    return `Email failed: ${msg}`;
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toHtml(alert: Alert): string {
  const body = esc(alert.text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .split("\n")
    .join("<br>");
  return `<div style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;color:#13233A;max-width:640px"><h2 style="font-size:18px;margin:0 0 12px">${esc(alert.subject)}</h2><p style="margin:0">${body}</p></div>`;
}

export async function appLink(env: Env, path: string): Promise<string | null> {
  const origin = await getMeta(env, "origin");
  return origin ? `${origin}${path}` : null;
}

/** Approve and reject links for grey-zone verdicts. Valid for 24 hours, no login needed. */
export async function reviewLinks(env: Env, decisionId: number): Promise<{ approve: string; reject: string } | null> {
  const origin = await getMeta(env, "origin");
  if (!origin) return null;
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const link = async (op: string) => {
    const sig = await sign(env.SPIKEWARD_SECRET, "review", `${decisionId}|${op}|${exp}`);
    return `${origin}/api/review?d=${decisionId}&op=${op}&exp=${exp}&sig=${sig}`;
  };
  return { approve: await link("approve"), reject: await link("reject") };
}
