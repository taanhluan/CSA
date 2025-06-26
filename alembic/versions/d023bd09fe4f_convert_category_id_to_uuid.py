from alembic import op
from typing import Sequence, Union
import sqlalchemy as sa
import uuid

revision: str = 'd023bd09fe4f'
down_revision: Union[str, Sequence[str], None] = '768b4379681a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # 1. Thêm cột id_tmp UUID tạm cho bảng service_categories
    op.add_column('service_categories', sa.Column('id_tmp', sa.dialects.postgresql.UUID(as_uuid=True), default=uuid.uuid4, nullable=True))
    op.execute("UPDATE service_categories SET id_tmp = gen_random_uuid()")

    # 2. Thêm cột category_id_tmp cho bảng services
    op.add_column('services', sa.Column('category_id_tmp', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("""
        UPDATE services
        SET category_id_tmp = sc.id_tmp
        FROM service_categories sc
        WHERE services.category_id::uuid = sc.id
    """)

    # ❌ Không drop constraint vì nó không tồn tại

    # 3. Xoá cột cũ & đổi tên cột mới
    op.drop_column('services', 'category_id')
    op.drop_column('service_categories', 'id')
    op.alter_column('services', 'category_id_tmp', new_column_name='category_id')
    op.alter_column('service_categories', 'id_tmp', new_column_name='id')

    # 4. Tạo lại constraint mới
    op.create_primary_key("pk_service_categories", "service_categories", ["id"])
    op.create_foreign_key(
        "services_category_id_fkey",
        "services", "service_categories",
        ["category_id"], ["id"]
    )

def downgrade():
    raise NotImplementedError("Downgrade from UUID not supported.")
