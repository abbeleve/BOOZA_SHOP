#!/usr/bin/env python3
"""Генератор заглушек для изображений блюд."""

import os
from pathlib import Path

IMAGES = {
    "pizza": ["margarita.jpg", "pepperoni.jpg", "four_cheese.jpg", "diablo.jpg", "hawaii.jpg", "meat.jpg", "veggie.jpg", "carbonara.jpg"],
    "sushi": ["philadelphia.jpg", "california.jpg", "dragon.jpg", "salmon_maki.jpg", "cucumber_maki.jpg", "tempura.jpg", "philadelphia_set.jpg"],
    "drinks": ["coca_cola.jpg", "orange_juice.jpg", "pepsi.jpg", "green_tea.jpg", "latte.jpg", "lemonade.jpg"],
    "snacks": ["fries.jpg", "onion_rings.jpg", "nuggets.jpg", "wings.jpg", "mozzarella_sticks.jpg", "croutons.jpg"],
    "desserts": ["tiramisu.jpg", "cheesecake.jpg", "panna_cotta.jpg", "brownie.jpg", "ice_cream.jpg"],
    "salads": ["caesar_chicken.jpg", "caesar_shrimp.jpg", "greek.jpg", "caprese.jpg"],
    "soups": ["borscht.jpg", "solyanka.jpg", "chicken_soup.jpg", "tom_yam.jpg"],
    "hot": ["ribeye.jpg", "salmon_grill.jpg", "chicken_breast.jpg", "ribs.jpg"],
    "pasta": ["carbonara_pasta.jpg", "bolognese.jpg", "alfredo.jpg", "seafood_pasta.jpg"],
    "burgers": ["cheeseburger.jpg", "double_burger.jpg", "chicken_burger.jpg", "veggie_burger.jpg"],
}

CATEGORY_COLORS = {
    "pizza": (255, 100, 100), "sushi": (255, 150, 100), "drinks": (100, 200, 255),
    "snacks": (255, 200, 100), "desserts": (255, 150, 200), "salads": (100, 255, 100),
    "soups": (200, 100, 50), "hot": (180, 50, 50), "pasta": (255, 220, 150), "burgers": (200, 100, 50),
}

def create_placeholder(filepath, category):
    from PIL import Image, ImageDraw, ImageFont
    width, height = 400, 300
    color = CATEGORY_COLORS.get(category, (200, 200, 200))
    
    img = Image.new("RGB", (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # Текст
    name = os.path.basename(filepath).replace(".jpg", "").replace("_", " ").title()
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), name, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), name, fill=(255, 255, 255), font=font)
    img.save(filepath, "JPEG", quality=85)
    print(f"  ✅ {filepath}")

def main():
    base_path = Path(__file__).parent.parent / "static" / "images"
    print("🎨 Генерация заглушек...")
    
    for category, files in IMAGES.items():
        category_path = base_path / category
        category_path.mkdir(parents=True, exist_ok=True)
        print(f"\n📁 {category}")
        for filename in files:
            filepath = category_path / filename
            if not filepath.exists():
                try:
                    create_placeholder(str(filepath), category)
                except ImportError:
                    print(f"  ⚠️  PIL не установлен: pip install Pillow")
                    return
            else:
                print(f"  ⏭️  {filename}")
    
    print("\n✅ Готово!")

if __name__ == "__main__":
    main()
