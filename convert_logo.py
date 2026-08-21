from PIL import Image
import os

path = os.path.join(os.path.dirname(__file__), "presidency_logo.png")
img = Image.open(path)
print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
img = img.convert("RGBA")
img.save(path, "PNG")
print(f"Converted to PNG, Size: {os.path.getsize(path)} bytes")
