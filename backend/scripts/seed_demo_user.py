# seed_demo_user.py
import datetime

from app import create_app
from app.extensions import bcrypt, mongo

def seed():
    app = create_app()
    with app.app_context():
        print("Checking MongoDB connection...")
        try:
            mongo.db.command('ping')
            print("Connected to MongoDB!")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return

        email = "kanishk@demo.com"
        password = "password123"
        name = "Kanishk Demo"

        # Check if user exists
        existing = mongo.db.users.find_one({"email": email})
        if existing:
            print(f"User {email} already exists. Updating password...")
            hashed_password = bcrypt.generate_password_hash(password)
            mongo.db.users.update_one(
                {"email": email},
                {"$set": {"password": hashed_password}}
            )
        else:
            print(f"Creating user {email}...")
            hashed_password = bcrypt.generate_password_hash(password)
            user_data = {
                "email": email,
                "password": hashed_password,
                "name": name,
                "created_at": datetime.datetime.utcnow()
            }
            mongo.db.users.insert_one(user_data)
        
        print(f"\nSUCCESS!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("\nYou can now use these credentials to Sign In.")

if __name__ == "__main__":
    seed()
