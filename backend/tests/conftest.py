from types import SimpleNamespace

import pytest
from bson import ObjectId

from app import create_app


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeUsersCollection:
    def __init__(self):
        self.documents = {}

    def find_one(self, query, projection=None):
        if "_id" in query:
            document = self.documents.get(str(query["_id"]))
        else:
            document = next(
                (doc for doc in self.documents.values() if doc.get("email") == query.get("email")),
                None,
            )

        if not document:
            return None

        result = dict(document)
        if projection:
            include_fields = {key for key, value in projection.items() if value}
            include_id = projection.get("_id", 1)
            if include_fields:
                filtered = {key: result[key] for key in include_fields if key in result}
                if include_id and "_id" in result:
                    filtered["_id"] = result["_id"]
                result = filtered
        return result

    def insert_one(self, document):
        inserted_id = document.get("_id", ObjectId())
        stored = dict(document)
        stored["_id"] = inserted_id
        self.documents[str(inserted_id)] = stored
        return FakeInsertResult(inserted_id)


class FakeDatabase:
    def __init__(self):
        self.users = FakeUsersCollection()


@pytest.fixture
def app():
    return create_app(
        {
            "TESTING": True,
            "SKIP_MONGO_PING": True,
            "MONGO_URI": "mongodb://localhost:27017/test_q_commerce",
            "JWT_SECRET_KEY": "test-secret",
            "SECRET_KEY": "test-secret",
        }
    )


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def fake_db():
    return FakeDatabase()


@pytest.fixture
def fake_mongo(fake_db):
    return SimpleNamespace(db=fake_db)
