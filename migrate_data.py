import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import pandas as pd

# Load environment variables
load_dotenv()
ENVIRONMENT = os.getenv("ENVIRONMENT")
DEV_DB_URL = os.getenv("DATABASE_URL_DEV")
PROD_DB_URL = os.getenv("DATABASE_URL_PROD")

if ENVIRONMENT != "prod":
    raise EnvironmentError("❌ ENVIRONMENT must be 'prod'. Migration aborted for safety!")

# Connect to DBs
dev_engine = create_engine(DEV_DB_URL)
prod_engine = create_engine(PROD_DB_URL)

# Migrate 'members'
table = "members"
print(f"\n🔄 Migrating table: {table}")

try:
    # Load from DEV
    dev_df = pd.read_sql_table(table, dev_engine)
    print(f"📊 Rows in DEV: {len(dev_df)}")

    if dev_df.empty:
        print("⚠️ Skipped: Table is empty in DEV.")
    else:
        # Clear PROD table
        with prod_engine.connect() as conn:
            conn.execute(text(f"DELETE FROM {table}"))
            conn.commit()
        print(f"🧨 Cleared existing rows in PROD.{table}")

        # Insert to PROD
        dev_df.to_sql(table, prod_engine, if_exists="append", index=False)
        print(f"✅ Migrated {len(dev_df)} rows to PROD.{table}")

except Exception as e:
    print(f"❌ Error during migration: {e}")
