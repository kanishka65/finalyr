def test_root_healthcheck(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json() == {"message": "Q-Commerce Backend is running!"}


def test_auth_test_endpoint(client):
    response = client.get("/auth/test")

    assert response.status_code == 200
    assert response.get_json() == {"message": "Auth routes are working!"}
