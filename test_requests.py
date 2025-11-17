import requests

# Include the API key header so the sample works with the protected backend.
HEADERS = {"X-API-KEY": "my-hardcoded-secret-abc123"}

response = requests.post("http://localhost:5000/add", json={
    "key": "test1",
    "value": {"value1": 5, "value2": 10, "value3": 15}
}, headers=HEADERS)

print(response.status_code)
try:
    print(response.json())
except Exception:
    print(response.text)
