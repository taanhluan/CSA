import requests

url = "https://csa-backend-v90k.onrender.com/api/users/login"
payload = {
    "phone": "0775081196",
    "password": "admin123"
}

res = requests.post(url, json=payload)

if res.status_code == 200:
    print("✅ Success:")
    print(res.json())
else:
    print(f"❌ Failed with status code: {res.status_code}")
    print("Response:", res.text)

