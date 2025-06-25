import psycopg2
import os

# ENVIRONMENT VARIABLES
DATABASE_URL_DEV = "postgresql://postgres:hZOETWIWyokNhTHzveyPRfjcyGXjjrlK@metro.proxy.rlwy.net:32695/railway"
DATABASE_URL_PROD = "postgresql://postgres:AN1ZGhCfhonWkaNNaBiLHYYHFFCICWju@yamabiko.proxy.rlwy.net:36739/railway"

def fetch_users_from_prod():
    conn = psycopg2.connect(DATABASE_URL_PROD)
    cur = conn.cursor()
    cur.execute("SELECT id, name, phone, email, role, password_hash, created_at FROM users;")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return users

def insert_users_to_dev(users):
    conn = psycopg2.connect(DATABASE_URL_DEV)
    cur = conn.cursor()

    for user in users:
        try:
            cur.execute("""
                INSERT INTO users (id, name, phone, email, role, password_hash, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    password_hash = EXCLUDED.password_hash,
                    created_at = EXCLUDED.created_at;
            """, user)
        except Exception as e:
            print(f"❌ Failed to insert user {user[2]}: {e}")

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Sync to DEV completed.")

if __name__ == "__main__":
    users = fetch_users_from_prod()
    insert_users_to_dev(users)
