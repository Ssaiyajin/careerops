"""Create the initial CareerOps schema."""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def _ensure_index(connection, name, table_name, columns, unique=False):
    indexes = {index["name"] for index in sa.inspect(connection).get_indexes(table_name)}
    if name not in indexes:
        op.create_index(name, table_name, columns, unique=unique)


def upgrade():
    connection = op.get_bind()
    inspector = sa.inspect(connection)

    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("hashed_password", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )

    if not sa.inspect(connection).has_table("resume_analysis"):
        op.create_table(
            "resume_analysis",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("candidate_name", sa.String(), nullable=True),
            sa.Column("email", sa.String(), nullable=True),
            sa.Column("ats_score", sa.Integer(), nullable=True),
            sa.Column("match_score", sa.Integer(), nullable=True),
            sa.Column("experience_level", sa.String(), nullable=True),
            sa.Column("resume_text", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )
    elif "user_id" not in {
        column["name"]
        for column in sa.inspect(connection).get_columns("resume_analysis")
    }:
        op.add_column(
            "resume_analysis",
            sa.Column("user_id", sa.Integer(), nullable=True),
        )

    if not sa.inspect(connection).has_table("api_usage_events"):
        op.create_table(
            "api_usage_events",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("operation", sa.String(length=32), nullable=False),
            sa.Column("units", sa.Integer(), nullable=False),
            sa.Column("created_at_epoch", sa.Float(), nullable=False),
        )

    _ensure_index(connection, "ix_users_email", "users", ["email"], unique=True)
    _ensure_index(
        connection,
        "ix_resume_analysis_user_id",
        "resume_analysis",
        ["user_id"],
    )
    _ensure_index(
        connection,
        "ix_api_usage_user_operation_time",
        "api_usage_events",
        ["user_id", "operation", "created_at_epoch"],
    )


def downgrade():
    op.drop_table("api_usage_events")
    op.drop_table("resume_analysis")
    op.drop_table("users")
