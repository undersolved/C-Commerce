from app.database.database import SessionLocal, engine, Base
from app.models.models import User, Category, Product
from app.auth import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if categories exist
        if db.query(Category.id).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding database...")

        # Admin user
        admin_user = User(
            email="admin@glasshop.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin StoreOwner",
            is_admin=1
        )
        db.add(admin_user)

        # Categories
        cat_tech = Category(name="Electronics & Tech", description="Sleek gadgets and modern audio devices")
        cat_wear = Category(name="Apparel & Style", description="Minimalist fashion and premium lifestyle items")
        cat_home = Category(name="Living & Decor", description="Aesthetic additions for modern workspaces")
        
        db.add_all([cat_tech, cat_wear, cat_home])
        db.commit()

        products = []
        for i in range(1, 35):
            products.append(Product(
                title=f"Tech Gadget {i}",
                description="High performance device.",
                price=10.0 + i,
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
                stock=100,
                category_id=cat_tech.id
            ))
        for i in range(1, 34):
            products.append(Product(
                title=f"Style Item {i}",
                description="Modern apparel.",
                price=20.0 + i,
                image_url="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
                stock=100,
                category_id=cat_wear.id
            ))
        for i in range(1, 34):
            products.append(Product(
                title=f"Home Decor {i}",
                description="Aesthetic home piece.",
                price=5.0 + i,
                image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
                stock=100,
                category_id=cat_home.id
            ))

        db.add_all(products)
        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
