import requests

# Include the API key header so the sample works with the protected backend.
HEADERS = {"X-API-KEY": "richardli-secret"}

payload = {
    "keys": ["demo", "counter"],
    "amount": 5
}

url = "https://pythingsrhl.pythonanywhere.com/increment" #"http://localhost:5000/increment"
response = requests.post(url, json=payload, headers=HEADERS)

print(response.status_code)
try:
    print(response.json())
except Exception:
    print(response.text)
