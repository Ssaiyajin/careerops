"""Add user ownership to pre-existing resume analyses."""

from alembic import op
import sqlalchemy as sa


revision = "0002_resume_owner"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    columns = {
        column["name"]
        for column in sa.inspect(connection).get_columns("resume_analysis")
    }
    if "user_id" not in columns:
        op.add_column(
            "resume_analysis",
            sa.Column("user_id", sa.Integer(), nullable=True),
        )

    indexes = {
        index["name"]
        for index in sa.inspect(connection).get_indexes("resume_analysis")
    }
    if "ix_resume_analysis_user_id" not in indexes:
        op.create_index(
            "ix_resume_analysis_user_id",
            "resume_analysis",
            ["user_id"],
        )


def downgrade():
    connection = op.get_bind()
    indexes = {
        index["name"]
        for index in sa.inspect(connection).get_indexes("resume_analysis")
    }
    if "ix_resume_analysis_user_id" in indexes:
        op.drop_index("ix_resume_analysis_user_id", table_name="resume_analysis")

    columns = {
        column["name"]
        for column in sa.inspect(connection).get_columns("resume_analysis")
    }
    if "user_id" in columns:
        op.drop_column("resume_analysis", "user_id")
