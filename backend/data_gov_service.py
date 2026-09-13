import requests

API_KEY = "579b464db66ec23bdd000001efabf75351f248696fb42fe887867840"

URL = "https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971"

headers = {
    "Authorization": API_KEY
}

params = {
    "format": "json",
    "limit": 1
}

print("Connecting to data.gov.in...")

try:
    response = requests.get(
        URL,
        headers=headers,
        params=params,
        timeout=30
    )

    print("Status:", response.status_code)
    print("Response:")
    print(response.text[:2000])

except Exception as e:
    print("Connection error:", e)