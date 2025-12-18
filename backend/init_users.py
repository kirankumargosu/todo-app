from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

# db = SessionLocal()

# if not db.query(User).filter_by(username="kiran").first():
#     db.add(User(
#         username="kiran",
#         password_hash=hash_password("adminpassword"),
#         role="admin"
#     ))

# if not db.query(User).filter_by(username="dhruv").first():
#     db.add(User(
#         username="dhruv",
#         password_hash=hash_password("userpassword"),
#         role="user"
#     ))

# db.commit()
# db.close()

def init_users():
    db = SessionLocal()

    if not db.query(User).filter_by(username="kiran").first():
        db.add(User(
            username="kiran",
            password_hash=hash_password("adminpassword"),
            role="admin"
        ))

    if not db.query(User).filter_by(username="dhruv").first():
        db.add(User(
            username="dhruv",
            password_hash=hash_password("userpassword"),
            role="user"
        ))

    db.commit()
    db.close()

from app.auth import hash_password, verify_password

def check_password():
    h = hash_password("adminpassword")
    print(h)
    print(verify_password("adminpassword", h))

if __name__ == "__main__":
    init_users()
    # check_password()