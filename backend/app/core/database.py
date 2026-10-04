import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

class Base(DeclarativeBase):
    pass

dev_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../legalsaathi_dev.db"))

def _create_engine(url: str):
    if "sqlite" in url:
        return create_async_engine(url, echo=False)
    return create_async_engine(
        url,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

engine = _create_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

_is_fallback_active = False

async def init_db():
    """Verify primary database or activate local SQLite in development."""
    global engine, AsyncSessionLocal, _is_fallback_active
    if "sqlite" in settings.DATABASE_URL:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        return

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("database_connected_postgres", url=settings.DATABASE_URL)
    except Exception as e:
        if settings.is_development:
            logger.warning("postgres_unavailable_fallback_to_sqlite", error=str(e))
            sqlite_url = f"sqlite+aiosqlite:///{dev_db_path}"
            engine = _create_engine(sqlite_url)
            AsyncSessionLocal = async_sessionmaker(
                engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
            _is_fallback_active = True
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("database_fallback_sqlite_ready", path=dev_db_path)
        else:
            raise

async def get_db() -> AsyncSession:
    global engine, AsyncSessionLocal, _is_fallback_active
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    except (ConnectionRefusedError, OSError) as conn_err:
        if settings.is_development and not _is_fallback_active:
            logger.warning("activating_sqlite_fallback_on_conn_error", error=str(conn_err))
            sqlite_url = f"sqlite+aiosqlite:///{dev_db_path}"
            engine = _create_engine(sqlite_url)
            AsyncSessionLocal = async_sessionmaker(
                engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
            _is_fallback_active = True
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            async with AsyncSessionLocal() as session:
                try:
                    yield session
                    await session.commit()
                except Exception:
                    await session.rollback()
                    raise
                finally:
                    await session.close()
        else:
            raise
