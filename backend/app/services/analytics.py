# services/analytics_service.py
from app.extensions import mongo
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import pandas as pd

def build_monthly_summary(user_id):
    """
    Build real monthly summary statistics for a user using MongoDB aggregation
    """
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        if not user: return {}
        user_email = user["email"]

        # 1. Total spend, avg order, and item count
        pipeline = [
            {"$match": {"user": user_email}},
            {"$group": {
                "_id": None,
                "total_spend": {"$sum": "$total_amount"},
                "total_orders": {"$sum": 1},
                "total_items": {"$sum": "$quantity"}
            }}
        ]
        
        main_stats = list(mongo.db.purchases.aggregate(pipeline))
        if not main_stats:
            return {
                "total_spend": 0, "avg_order_value": 0, "total_orders": 0,
                "by_category": [], "budget": {"set": 4000, "spent": 0, "remaining": 4000, "percent": 0}
            }
        
        stats = main_stats[0]
        
        # 2. Spend by category
        cat_pipeline = [
            {"$match": {"user": user_email}},
            {"$group": {
                "_id": "$category",
                "total": {"$sum": "$total_amount"},
                "count": {"$sum": 1}
            }},
            {"$project": {"key": "$_id", "total": 1, "count": 1, "_id": 0}},
            {"$sort": {"total": -1}}
        ]
        categories = list(mongo.db.purchases.aggregate(cat_pipeline))
        
        total_spend = stats["total_spend"]
        budget_limit = 4000 # This could be fetched from user profile settings later
        
        summary = {
            "total_spend": round(total_spend, 2),
            "avg_order_value": round(total_spend / stats["total_orders"], 2) if stats["total_orders"] > 0 else 0,
            "total_orders": stats["total_orders"],
            "by_category": categories,
            "budget": {
                "set": budget_limit,
                "spent": round(total_spend, 2),
                "remaining": max(0, round(budget_limit - total_spend, 2)),
                "percent": min(100, int((total_spend / budget_limit) * 100))
            }
        }
        return summary
    except Exception as e:
        print(f"Error building monthly summary: {e}")
        return {}

def build_heatmap_matrix(user_id):
    """
    Build real heatmap data for user spending patterns from purchase history
    """
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        if not user: return [[0]*24 for _ in range(7)]
        user_email = user["email"]

        # Matrix: Days (0-6) x Hours (0-23)
        matrix = [[0 for _ in range(24)] for _ in range(7)]
        
        # Aggregate spend by day-of-week and hour
        # order_datetime is a python datetime object
        purchases = mongo.db.purchases.find({"user": user_email}, {"order_datetime": 1, "total_amount": 1})
        
        for p in purchases:
            dt = p.get("order_datetime")
            if dt and isinstance(dt, datetime):
                # weekday() returns 0 for Monday, 6 for Sunday
                day = dt.weekday() 
                hour = dt.hour
                matrix[day][hour] += p.get("total_amount", 0)
        
        # Round values for clean UI
        for r in range(7):
            for c in range(24):
                matrix[r][c] = round(matrix[r][c], 2)
                
        return matrix
    except Exception as e:
        print(f"Error building heatmap matrix: {e}")
        return [[0 for _ in range(24)] for _ in range(7)]

def replenishment_suggestions(user_id):
    """
    Generate replenishment suggestions based on real recurring purchase patterns
    """
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        if not user: return []
        user_email = user["email"]

        # Simple logic: Find items purchased more than twice and calculate average interval
        pipeline = [
            {"$match": {"user": user_email}},
            {"$sort": {"item_name": 1, "order_datetime": 1}},
            {"$group": {
                "_id": "$item_name",
                "dates": {"$push": "$order_datetime"},
                "category": {"$first": "$category"},
                "count": {"$sum": 1}
            }},
            {"$match": {"count": {"$gt": 1}}} # Only items bought multiple times
        ]
        
        items = list(mongo.db.purchases.aggregate(pipeline))
        suggestions = []
        
        now = datetime.now()
        
        for item in items:
            dates = item["dates"]
            # Calculate average days between purchases
            intervals = []
            for i in range(len(dates)-1):
                if dates[i] and dates[i+1]:
                    diff = (dates[i+1] - dates[i]).days
                    if diff > 0: intervals.append(diff)
            
            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                last_purchase = dates[-1]
                days_since_last = (now - last_purchase).days
                days_left = max(0, round(avg_interval - days_since_last))
                
                if days_left <= 3:
                    suggestions.append({
                        "category": item["category"],
                        "item": item["_id"],
                        "predicted_days_left": days_left,
                        "suggestion": "Time to restock" if days_left <= 1 else "Running low",
                        "priority": "high" if days_left <= 1 else "medium"
                    })
        
        return suggestions
    except Exception as e:
        print(f"Error generating replenishment suggestions: {e}")
        return []

def get_spending_trends(user_id, months=6):
    """
    Get real spending trends over time
    """
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        if not user: return []
        user_email = user["email"]

        now = datetime.now()
        start_date = now - timedelta(days=30*months)
        
        pipeline = [
            {"$match": {
                "user": user_email,
                "order_datetime": {"$gte": start_date}
            }},
            {"$project": {
                "month": {"$month": "$order_datetime"},
                "year": {"$year": "$order_datetime"},
                "total_amount": 1
            }},
            {"$group": {
                "_id": {"month": "$month", "year": "$year"},
                "spend": {"$sum": "$total_amount"}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        
        results = list(mongo.db.purchases.aggregate(pipeline))
        monthly_data = []
        
        for r in results:
            dt = datetime(r["_id"]["year"], r["_id"]["month"], 1)
            monthly_data.append({
                "month": dt.strftime('%b'),
                "spend": round(r["spend"], 2)
            })
            
        return monthly_data
    except Exception as e:
        print(f"Error getting spending trends: {e}")
        return []

def get_cross_platform_comparison(user_id):
    """
    KILLER FEATURE: Compare prices of identical items across platforms
    """
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        user_email = user["email"] if user else None
        
        # Match identical item names across different platforms
        pipeline = [
            {"$match": {"user": user_email}},
            {"$group": {
                "_id": {
                    "item": "$item_name",
                    "platform": "$platform"
                },
                "avg_price": {"$avg": "$unit_price"},
                "category": {"$first": "$category"}
            }},
            {"$group": {
                "_id": "$_id.item",
                "category": {"$first": "$category"},
                "prices": {
                    "$push": {
                        "platform": "$_id.platform",
                        "price": {"$round": ["$avg_price", 2]}
                    }
                },
                "platform_count": {"$sum": 1}
            }},
            {"$match": {"platform_count": {"$gt": 1}}} # Only items appearing on multiple platforms
        ]
        
        comparisons = list(mongo.db.purchases.aggregate(pipeline))
        
        formatted = []
        for item in comparisons:
            # Find cheapest
            sorted_prices = sorted(item["prices"], key=lambda x: x["price"])
            cheapest = sorted_prices[0]
            most_expensive = sorted_prices[-1]
            savings = round(most_expensive["price"] - cheapest["price"], 2)
            
            formatted.append({
                "item": item["_id"],
                "category": item["category"],
                "prices": item["prices"],
                "best_platform": cheapest["platform"],
                "potential_savings": savings
            })
            
        return formatted
    except Exception as e:
        print(f"Error in platform comparison: {e}")
        return []
