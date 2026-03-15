import csv
import random
from datetime import datetime, timedelta

def generate_sample_data(filename, num_records):
    sku_list = ['ELEC-001', 'ELEC-002', 'CLOT-001', 'CLOT-002', 'FOOD-001', 'FOOD-002', 'HOME-001', 'HOME-002', 'BEAU-001', 'BEAU-002']
    customer_emails = ['user{}@example.com'.format(i) for i in range(1, 50)]
    locations = [
        ('Western', 'Colombo'), ('Central', 'Kandy'), ('Southern', 'Galle'),
        ('Northern', 'Jaffna'), ('North Western', 'Negombo')
    ]
    statuses = ['Delivered', 'Shipped', 'Processing', 'Cancelled']
    payment_methods = ['Credit Card', 'Cash', 'Online Transfer']
    
    start_date = datetime(2026, 1, 1)

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['order_id', 'customer_email', 'product_sku', 'quantity', 'unit_price', 'order_date', 'status', 'region', 'payment_method', 'discount_amount', 'shipping_address'])
        
        for i in range(1, num_records + 1):
            order_id = f"ORD-{2000 + i}"
            email = random.choice(customer_emails)
            sku = random.choice(sku_list)
            quantity = random.randint(1, 10)
            
            # approximate prices
            unit_price = random.choice([1500, 2500, 3200, 4500, 5500, 12000, 15000, 85000])
            
            days_offset = random.randint(0, 90)
            order_date = (start_date + timedelta(days=days_offset)).strftime('%Y-%m-%d')
            
            status = random.choices(statuses, weights=[70, 15, 10, 5])[0]
            region, city = random.choice(locations)
            payment = random.choice(payment_methods)
            discount = random.choice([0, 0, 0, 100, 200, 500, 1000])
            address = f"{random.randint(1,100)} Main Street {city}"
            
            writer.writerow([order_id, email, sku, quantity, unit_price, order_date, status, region, payment, discount, address])

if __name__ == '__main__':
    generate_sample_data('large_sample_data.csv', 500)
    print("Generated 500 records in large_sample_data.csv")
