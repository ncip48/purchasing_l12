from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use Laravel's existing database
DATABASE_URL = "mysql+mysqldb://root:kocak123@localhost/l12_purchasing"

# Create engine with read-only access
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory (no schema modifications)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model (for reflection, no migrations)
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
