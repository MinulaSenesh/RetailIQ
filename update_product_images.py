import pymysql

connection_config = {
    "host": "localhost",
    "user": "root",
    "password": "root123",
    "database": "retailiq",
    "port": 3306
}

# SKU to Image Mapping (User Provided & Curated)
IMAGE_MAP = {
    'FOOD-001': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80', # Coffee Beans
    'FOOD-002': 'https://objectstorage.ap-mumbai-1.oraclecloud.com/n/softlogicbicloud/b/cdn/o/products/600-600/115825--01--1604995422.jpeg', # Green Tea Pack
    'CLOT-001': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', # Cotton T-Shirt
    'CLOT-002': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', # Denim Jeans
    'HOME-001': 'https://keplerbrooks.com/cdn/shop/files/ItaliaZoomedInLifestyle.webp?v=1686043205', # Office Chair
    'BEAU-002': 'https://viana.lk/wp-content/uploads/2019/12/Anti-dandruff-shampoo.png', # Shampoo
    'wm-789654': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', # Mouse
    'em-34': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', # Laptop
    'rf-3456': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', # Sony Headphone
    'RT-31': 'https://media.istockphoto.com/id/1354031012/photo/red-t-shirt-mockup-men-as-design-template-tee-shirt-blank-isolated-on-white-front-view.jpg?s=612x612&w=0&k=20&c=_5QLLkUa0-ZzSK1rp6Ie-ZRBPOEku4as4ZMrZg-y2GI=', # red t shirt
    'BN-21': 'https://fruitfortheoffice.co.uk/media/.renditions/wysiwyg/42e9as7nataai4a6jcufwg.jpeg', # bananas
    'MB-56': 'https://www.notebookcheck.net/fileadmin/_processed_/a/3/csm_IMG_1008_47c6b245b1.jpg', # macbookm3
    'RN-45': 'https://www.shutterstock.com/shutterstock/videos/1022169022/thumb/1.jpg?ip=x480', # ring
    'PH-57': 'https://cdn.mos.cms.futurecdn.net/PLdvLeFwnqidAYjRVvtFxX.jpg', # phone
    'ELEC-001': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', # Smartphone X1 fallback
    'ELEC-002': 'https://images.unsplash.com/photo-1590664095641-7fa05f689813?w=800&q=80', # Earbuds fallback
}

def update_images():
    try:
        conn = pymysql.connect(**connection_config)
        with conn.cursor() as cursor:
            for sku, url in IMAGE_MAP.items():
                print(f"Updating {sku}...")
                cursor.execute("UPDATE products SET image_url = %s WHERE sku = %s", (url, sku))
            
            # Additional fallback for any remaining NULLs
            cursor.execute("UPDATE products SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' WHERE image_url IS NULL")
            
        conn.commit()
        conn.close()
        print("Product images updated successfully.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    update_images()
