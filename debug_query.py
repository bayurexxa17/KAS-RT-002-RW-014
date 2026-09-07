from backend.database import SessionLocal
from backend.models import Product

try:
    db = SessionLocal()
    print("Querying Products...")
    products = db.query(Product).all()
    print(f"Found {len(products)} products.")
    for p in products:
        print(f"- {p.name} (Owner: {p.owner_id})")
except Exception as e:
    import traceback
    traceback.print_exc()
