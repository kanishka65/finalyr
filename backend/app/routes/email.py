# routes/email.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import random
from datetime import datetime, timedelta
from bson.objectid import ObjectId

from app.extensions import mongo
from app.models.purchases import insert_purchases

email_bp = Blueprint("email_bp", __name__)

@email_bp.route("/sync", methods=["POST"])
@jwt_required()
def sync_emails():
    """
    Simulated Gmail Sync for Demo
    In core implementation, this would trigger email_parser.py
    """
    user_id = get_jwt_identity()
    
    # Simulate finding 3 new orders in Gmail
    platforms = ["Blinkit", "Zepto", "Swiggy Instamart"]
    items = ["Milk", "Bread", "Eggs", "Chips", "Coke", "Chicken", "Rice"]
    categories = ["dairy", "bakery", "dairy", "snacks", "beverages", "meat", "grains"]
    
    new_data = []
    for _ in range(3):
        idx = random.randint(0, len(items)-1)
        price = random.randint(30, 400)
        new_data.append({
            "item_name": items[idx],
            "category": categories[idx],
            "platform": random.choice(platforms),
            "quantity": random.randint(1, 3),
            "unit_price": price,
            "total_amount": price,
            "order_datetime": datetime.now() - timedelta(hours=random.randint(1, 48))
        })
        
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
    if user:
        for d in new_data: d["user"] = user["email"]
        insert_purchases(new_data)
        
    return jsonify({
        "message": "Gmail sync successful!",
        "new_orders": len(new_data),
        "last_sync": datetime.now().isoformat()
    }), 200

@email_bp.route("/status", methods=["GET"])
@jwt_required()
def status():
    return jsonify({
        "connected": True,
        "last_sync": (datetime.now() - timedelta(hours=2)).isoformat(),
        "account": "user@gmail.com"
    }), 200
