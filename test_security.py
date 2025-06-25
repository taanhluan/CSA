# test_security.py
from app.utils.security import hash_password, verify_password

def run_password_tests():
    print("=== Password Hashing Test ===")
    
    # ✅ Mật khẩu gốc
    raw_password = "csa2025"
    wrong_password = "wrongpass"

    # ✅ Hash mật khẩu
    hashed = hash_password(raw_password)
    print("🔐 Hashed Password:", hashed)

    # ✅ Kiểm tra đúng mật khẩu
    is_valid = verify_password(raw_password, hashed)
    print("✅ Correct password verification:", is_valid)

    # ❌ Kiểm tra sai mật khẩu
    is_wrong = verify_password(wrong_password, hashed)
    print("❌ Wrong password verification:", is_wrong)

if __name__ == "__main__":
    run_password_tests()
