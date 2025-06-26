import requests

res = requests.post(
    "https://csa-backend-v90k.onrender.com/api/users/login",
    json={
        "phone": "0775081196",
        "password": "admin123"
    }
)

if res.status_code == 200:
    print("✅ Đăng nhập thành công:")
    print(res.json())
else:
    print("❌ Đăng nhập thất bại:")
    print("Status code:", res.status_code)
    print("Detail:", res.json())
