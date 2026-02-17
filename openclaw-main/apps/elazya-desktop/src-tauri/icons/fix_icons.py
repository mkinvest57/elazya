import os
import sys
import site

# Add user site packages to path
sys.path.append(site.getusersitepackages())

try:
    from PIL import Image
except ImportError:
    # Try one more fallback
    import distutils.sysconfig
    sys.path.append(distutils.sysconfig.get_python_lib())
    try:
        from PIL import Image
    except ImportError:
        print(f"Pillow not installed. Path: {sys.path}")
        sys.exit(1)

def convert_to_rgba(src, dest, size):
    img = Image.open(src).convert("RGBA")
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(dest, "PNG")
    print(f"Created {dest}")

src = "/Users/sashimi/Documents/Elazya_Projects/elazya/src-tauri/icons/source_logo.jpg"
icons_dir = "/Users/sashimi/Documents/Elazya_Projects/elazya/src-tauri/icons"

sizes = [
    (32, "32x32.png"),
    (128, "128x128.png"),
    (256, "128x128@2x.png"),
    (1024, "icon.png"),
]

for size, name in sizes:
    convert_to_rgba(src, os.path.join(icons_dir, name), size)
