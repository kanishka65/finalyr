from bson import ObjectId

from app.routes import auth as auth_routes


def test_register_creates_user_and_tokens(client, fake_mongo, monkeypatch):
    monkeypatch.setattr(auth_routes, "mongo", fake_mongo)

    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "test123",
            "name": "New User",
        },
    )

    body = response.get_json()

    assert response.status_code == 201
    assert body["message"] == "User registered successfully"
    assert body["user"]["email"] == "newuser@example.com"
    assert body["user"]["name"] == "New User"
    assert body["access_token"]
    assert body["refresh_token"]


def test_register_rejects_duplicate_email(client, fake_mongo, monkeypatch):
    fake_mongo.db.users.insert_one(
        {
            "_id": ObjectId(),
            "email": "existing@example.com",
            "password": b"hashed-password",
            "name": "Existing User",
        }
    )
    monkeypatch.setattr(auth_routes, "mongo", fake_mongo)

    response = client.post(
        "/auth/register",
        json={"email": "existing@example.com", "password": "test123"},
    )

    assert response.status_code == 409
    assert response.get_json() == {"error": "User already exists"}
