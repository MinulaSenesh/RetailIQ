import pandas as pd
from sqlalchemy import create_engine, text
try:
    engine = create_engine("mysql+pymysql://root:root123@localhost:3306/retailiq")
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT COUNT(DISTINCT DATE(order_date)) FROM orders WHERE status != 'Cancelled'"), conn)
        count = df.iloc[0, 0]
        print(f"COUNT_RESULT: {count}")
        
        # Also check total orders
        res = conn.execute(text("SELECT COUNT(*) FROM orders"))
        total = res.fetchone()[0]
        print(f"TOTAL_ORDERS: {total}")
except Exception as e:
    print(f"ERROR: {e}")
