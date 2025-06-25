from passlib.hash import bcrypt

password = "admin123"
hashed = bcrypt.hash(password)
print("Hashed password:", hashed)
