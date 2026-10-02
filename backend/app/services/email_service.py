import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def send_password_reset_email(recipient_email: str, reset_link: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    if not smtp_host:
        logger.warning(
            "SMTP_HOST is not configured; password reset email was not sent. "
            "Set SMTP_HOST to enable real email delivery."
        )
        return False

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM_EMAIL", smtp_username or "no-reply@localhost")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes", "on"}

    subject = "CareerOps password reset request"
    body = (
        "You requested a password reset for your CareerOps account.\n\n"
        f"Reset your password here: {reset_link}\n\n"
        "If you did not request this, you can ignore this email."
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = smtp_from
    message["To"] = recipient_email
    message.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            if use_tls:
                server.starttls()
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.send_message(message)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", recipient_email)
        return False
