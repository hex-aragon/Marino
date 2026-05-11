import { Resend } from 'resend';
import type { AgentAlert } from '@/types';

const ALERT_FROM = 'alerts@seawatch.dev';
const ALERT_TO = '0xrobertseo@gmail.com';

export async function sendHighAlertEmail(alert: AgentAlert): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log('[alerts] RESEND_API_KEY missing; skip email', alert.mmsi, alert.type, alert.message);
    return;
  }

  try {
    const resend = new Resend(key);
    const subject = `[SeaWatch HIGH] ${alert.shipname}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;color:#0a1628;">
        <h2 style="color:#dc2626;margin:0 0 12px 0;">해양 위험 감지</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 12px;color:#64748b;">선박명</td><td style="padding:6px 12px;font-weight:600;">${alert.shipname}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">MMSI</td><td style="padding:6px 12px;">${alert.mmsi}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">위험 등급</td><td style="padding:6px 12px;color:#dc2626;font-weight:700;">${alert.level}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">유형</td><td style="padding:6px 12px;">${alert.type}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">메시지</td><td style="padding:6px 12px;">${alert.message}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">권장 조치</td><td style="padding:6px 12px;">${alert.action}</td></tr>
          <tr><td style="padding:6px 12px;color:#64748b;">발생 시각</td><td style="padding:6px 12px;">${alert.createdAt}</td></tr>
        </table>
        <p style="margin-top:24px;color:#64748b;font-size:12px;">— SeaWatch AI Maritime Agent</p>
      </div>
    `;

    await resend.emails.send({
      from: ALERT_FROM,
      to: ALERT_TO,
      subject,
      html,
    });
  } catch (err) {
    console.error('[alerts] send failed', err);
  }
}
