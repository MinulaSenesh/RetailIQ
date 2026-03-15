import pymysql
import json

connection_config = {
    "host": "localhost",
    "user": "root",
    "password": "root123",
    "database": "retailiq",
    "port": 3306
}

tables = [
    "users",
    "products",
    "categories",
    "orders",
    "order_items",
    "customers",
    "upload_history"
]

def verify():
    results = {}
    try:
        conn = pymysql.connect(**connection_config)
        with conn.cursor() as cursor:
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                results[table] = count
            
            # Check for specifically orphaned items
            cursor.execute("SELECT COUNT(*) FROM order_items WHERE order_id NOT IN (SELECT order_id FROM orders)")
            results["orphaned_items"] = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM orders WHERE customer_id NOT IN (SELECT customer_id FROM customers)")
            results["orphaned_orders"] = cursor.fetchone()[0]
            
            # Check if any passwords are plain text (just a basic length check for BCrypt hashes)
            cursor.execute("SELECT COUNT(*) FROM users WHERE length(password_hash) < 40")
            results["unencrypted_passwords"] = cursor.fetchone()[0]

        conn.close()
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify()
