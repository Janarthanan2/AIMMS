import requests

def test_upload():
    url = "http://localhost:8000/extract/receipt"
    # Create a simple red image as a dummy receipt
    from PIL import Image
    import io
    
    img = Image.new('RGB', (800, 1000), color = 'white')
    # Add some text might be needed for actual detection but let's see if it runs
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    files = {'file': ('test.png', img_byte_arr, 'image/png')}
    
    try:
        response = requests.post(url, files=files)
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_upload()
