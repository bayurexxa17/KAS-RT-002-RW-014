import sqlite3

def check_columns():
    conn = sqlite3.connect('kas_rt.db')
    cursor = conn.cursor()
    
    tables = ['warga', 'users', 'settings', 'products']
    
    for table in tables:
        print(f"--- Table: {table} ---")
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            col_names = [col[1] for col in columns]
            print(col_names)
            
            # Specific checks
            if table == 'warga' and 'foto_url' not in col_names:
                print(">>> MISSING: foto_url in warga")
            if table == 'users' and 'foto_url' not in col_names:
                print(">>> MISSING: foto_url in users")
            if table == 'settings' and 'logo_url' not in col_names:
                print(">>> MISSING: logo_url in settings")
                
        except Exception as e:
            print(f"Error reading table {table}: {e}")
            
    conn.close()

if __name__ == "__main__":
    check_columns()
