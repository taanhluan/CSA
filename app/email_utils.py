import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

# Load cấu hình SMTP từ biến môi trường
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_debt_reminder_email(booking):
    # Nếu không có email thì bỏ qua
    if not getattr(booking, "email", None):
        print(f"⚠️ Booking {booking.id} không có email — bỏ qua.")
        return

    try:
        msg = MIMEMultipart()
        msg["Subject"] = f"🔔 Nhắc nợ booking ngày {booking.date_time.strftime('%d/%m/%Y')}"
        msg["From"] = SMTP_USERNAME
        msg["To"] = booking.email

        body = f"""
        Xin chào {booking.member_name},

        Đây là thông báo nhắc nợ cho booking ngày {booking.date_time.strftime('%d/%m/%Y')}:

        - Tổng cần thanh toán: {booking.grand_total:,.0f}₫
        - Đã thanh toán: {booking.amount_paid:,.0f}₫
        - Còn nợ: {booking.grand_total - booking.amount_paid:,.0f}₫

        Ghi chú: {booking.debt_note or 'Không có'}

        Vui lòng thanh toán sớm để tránh bị từ chối dịch vụ.

        Trân trọng,
        Hệ thống CSA - Quản lý sân bóng
        """.strip()

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"✅ Đã gửi nhắc nợ tới {booking.member_name} <{booking.email}>")

    except Exception as e:
        print(f"Gửi email thất bại cho {booking.email}: {e}")
