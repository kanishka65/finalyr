from bson import ObjectId

from app.extensions import bcrypt
from app.routes import auth as auth_routes


def test_login_returns_tokens_for_valid_credentials(client, fake_mongo, monkeypatch):
    hashed_password = bcrypt.generate_password_hash("test123")
    user_id = ObjectId()
    fake_mongo.db.users.insert_one(
        {
            "_id": user_id,
            "email": "user@example.com",
            "password": hashed_password,
            "name": "Test User",
        }
    )
    monkeypatch.setattr(auth_routes, "mongo", fake_mongo)

    response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "test123"},
    )

    body = response.get_json()

    assert response.status_code == 200
    assert body["user"]["id"] == str(user_id)
    assert body["user"]["email"] == "user@example.com"
    assert body["access_token"]
    assert body["refresh_token"]


def test_login_rejects_invalid_password(client, fake_mongo, monkeypatch):
    fake_mongo.db.users.insert_one(
        {
            "_id": ObjectId(),
            "email": "user@example.com",
            "password": bcrypt.generate_password_hash("correct-password"),
            "name": "Test User",
        }
    )
    monkeypatch.setattr(auth_routes, "mongo", fake_mongo)

    response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.get_json() == {"error": "Invalid credentials"}
