import requests

url = "http://localhost:8000/api/users/login"  # đổi lại nếu bạn chạy online

payload = {
    "phone": "0775081196",      # 🔁 Thay bằng số thật trong DB
    "password": "admin123"  # 🔁 Thay bằng mật khẩu thật
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    print("✅ Đăng nhập thành công:")
    print(response.json())
else:
    print("❌ Đăng nhập thất bại:")
    print("Status code:", response.status_code)
    print("Detail:", response.json())
