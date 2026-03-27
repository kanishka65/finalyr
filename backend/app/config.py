import os


class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/q_commerce")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-for-dev")
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-secret")
    TESTING = os.environ.get("TESTING", "0") == "1"
    SKIP_MONGO_PING = os.environ.get("SKIP_MONGO_PING", "0") == "1"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
