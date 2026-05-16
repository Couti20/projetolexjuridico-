from urllib.parse import quote

import httpx

from app.config import settings


def is_email_reset_configured() -> bool:
    return bool(settings.BREVO_API_KEY and settings.BREVO_SENDER_EMAIL)


def send_password_reset_email(*, to_email: str, to_name: str, token: str) -> None:
    if not is_email_reset_configured():
        raise RuntimeError("Brevo não configurado para envio de recuperação de senha.")

    reset_link = f"{settings.FRONT_RESET_PASSWORD_URL}?token={quote(token)}"
    sender_name = settings.BREVO_SENDER_NAME or "Lex"

    ttl_minutes = settings.PASSWORD_RESET_TOKEN_TTL_MINUTES

    html_content = f"""
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;color:#0f172a;">Redefinição de senha</h1>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
                  Olá{", " + to_name if to_name else ""}, recebemos uma solicitação para redefinir sua senha no <strong>Lex</strong>.
                </p>
                <p style="margin:0 0 20px 0;">
                  <a href="{reset_link}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px;">
                    Redefinir senha
                  </a>
                </p>
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#475569;">
                  Este link expira em <strong>{ttl_minutes} minuto(s)</strong> e pode ser usado apenas uma vez.
                </p>
                <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#475569;">
                  Se você não solicitou esta alteração, ignore este e-mail com segurança.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                  Lex • Suporte: suporte@lexjuridico.com.br
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""

    payload = {
        "sender": {"name": sender_name, "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": to_email, "name": to_name}],
        "subject": "Recuperação de senha - Lex",
        "htmlContent": html_content,
    }

    response = httpx.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": settings.BREVO_API_KEY,
        },
        json=payload,
        timeout=15.0,
    )
    response.raise_for_status()
