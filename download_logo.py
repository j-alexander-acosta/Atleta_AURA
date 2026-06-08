import urllib.request

url = "https://www.ucn.cl/content/uploads/2023/05/ucn-escudo-full-color.png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response, open('ucn-logo.png', 'wb') as out_file:
        data = response.read()
        out_file.write(data)
    print("Downloaded logo from UCN site")
except Exception as e:
    print(f"Error 1: {e}")
    url2 = "https://www.ucn.cl/content/uploads/2023/05/ucn-escudo-full-color.png"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req2) as response, open('ucn-logo.png', 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print("Downloaded logo from Wikimedia")
    except Exception as e2:
        print(f"Error 2: {e2}")
