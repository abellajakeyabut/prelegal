from fastapi.testclient import TestClient


def test_serves_home_page(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "home" in response.text


def test_serves_nested_page(client: TestClient) -> None:
    response = client.get("/nda/")
    assert response.status_code == 200
    assert "nda" in response.text


def test_redirects_page_without_trailing_slash(client: TestClient) -> None:
    response = client.get("/nda", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"].endswith("/nda/")


def test_api_routes_take_priority(client: TestClient) -> None:
    assert client.get("/api/health").json()["status"] == "ok"


def test_unknown_page_is_404(client: TestClient) -> None:
    assert client.get("/missing/").status_code == 404
