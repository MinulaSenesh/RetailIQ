from sqlalchemy import create_engine, text
try:
    engine = create_engine('mysql+pymysql://root:root123@localhost:3306/retailiq')
    with engine.connect() as conn:
        result = conn.execute(text('SELECT username, email, role, is_active FROM users'))
        users = [dict(row._mapping) for row in result]
        print("USER_LIST_START")
        for u in users:
            print(f"USER: {u['username']} | EMAIL: {u['email']} | ROLE: {u['role']} | ACTIVE: {u['is_active']}")
        print("USER_LIST_END")
except Exception as e:
    print(f"DATABASE_ERROR: {e}")
