import requests

# Include the API key header so the sample works with the protected backend.
HEADERS = {"X-API-KEY": "richardli-secret"}

payload = {
    "keys": ["demo", "counter"],
    "amount": 5
}

response = requests.post("http://localhost:5000/increment", json=payload, headers=HEADERS)

print(response.status_code)
try:
    print(response.json())
except Exception:
    print(response.text)
