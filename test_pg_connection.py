import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL_DEV")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ SUCCESS: Connected to the database!")
    conn.close()
except OperationalError as e:
    print("❌ ERROR: Failed to connect")
    print(e)
