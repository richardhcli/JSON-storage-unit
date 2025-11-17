import requests

response = requests.post("http://localhost:5000/add", json={
    "key": "test1",
    "value": {"value1": 5, "value2": 10, "value3": 15}
})

print(response.json())
