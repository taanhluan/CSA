import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Thêm đường dẫn để Alembic có thể import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import Base metadata và tất cả model ở đây để Alembic nhận diện schema
from app.database import Base
from app.models import booking, member, service, category  # <-- Import tất cả model bạn có

# Alembic Config object
config = context.config

# Thiết lập logging theo config alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata cho autogenerate migration
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Chạy migration ở chế độ offline (không kết nối DB trực tiếp)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Chạy migration ở chế độ online (kết nối DB trực tiếp)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # Đặt thêm tùy chọn khác nếu cần, ví dụ compare_type=True để tự động detect thay đổi kiểu cột
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# Chạy migration tùy theo chế độ offline hay online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
