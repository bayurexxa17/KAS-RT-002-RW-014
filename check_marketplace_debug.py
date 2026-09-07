import requests

try:
    print("Checking /api/marketplace...")
    response = requests.get("http://localhost:8000/api/marketplace")
    if response.status_code == 200:
        data = response.json()
        print(f"[API] Marketplace OK. Count: {len(data)}")
    else:
        print(f"[API] Marketplace Failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"[API] Error calling Marketplace: {e}")

try:
    print("Checking /api/warga...")
    response = requests.get("http://localhost:8000/api/warga")
    if response.status_code == 200:
        data = response.json()
        print(f"[API] Warga OK. Count: {len(data)}")
    else:
        print(f"[API] Warga Failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"[API] Error calling Warga: {e}")
