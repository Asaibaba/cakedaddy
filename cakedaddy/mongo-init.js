db = db.getSiblingDB('cakedaddy');

db.createUser({
    user: "cakedaddy",
    pwd: "cakedaddy123",
    roles: [
        { role: "readWrite", db: "cakedaddy" },
        { role: "dbAdmin", db: "cakedaddy" }
    ]
});

db.users.insertOne({
    username: "admin",
    email: "admin@cakedaddy.com",
    password: "admin123",
    role: "ADMIN",
    phone: "1234567890",
    address: "Admin Street",
    createdAt: new Date()
});

db.products.insertMany([
    {
        name: "Chocolate Cake",
        description: "Rich dark chocolate cake",
        price: 29.99,
        category: "Cakes",
        imageUrl: "images/chocolate.jpg",
        stockQuantity: 10,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

