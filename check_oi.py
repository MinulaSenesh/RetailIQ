import os

API = r"D:\RetailQ\retailiq-api\src\main\java\com\retailiq\api\entity"

# Fix 1: Add @JsonIgnore to OrderItem.order field
oi_path = os.path.join(API, "OrderItem.java")
oi = open(oi_path, encoding="utf-8").read()
print("OrderItem.java content:")
print(oi)