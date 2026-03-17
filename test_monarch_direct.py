import aiohttp
import asyncio
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

async def test_monarch():
    upload_url = "https://api.monarchupload.cc/v3/upload"
    secret = os.getenv("MONARCH_SECRET", "RatUFrFSDWXg")
    
    # Just some dummy bytes
    file_bytes = b"This is a test file content"
    filename = "test.txt"
    
    print(f"Uploading to Monarch with secret: {secret[:4]}...")
    
    form_data = aiohttp.FormData()
    form_data.add_field('secret', secret)
    form_data.add_field('file', file_bytes, filename=filename, content_type='text/plain')
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(upload_url, data=form_data) as response:
                print(f"Status: {response.status}")
                text = await response.text()
                print(f"Response: {text}")
                if response.status == 200:
                    result = await response.json()
                    print(f"URL: {result.get('data', {}).get('url')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_monarch())
