# routes/prices.py
# Real-time price comparison endpoint
from flask import Blueprint, jsonify, request
from app.services.price_comparison import DEFAULT_ITEMS, compare_prices, get_price_stats

price_bp = Blueprint("price_bp", __name__)

@price_bp.route("/live", methods=["GET"])
def live_prices():
    """
    Fetch real prices from Blinkit, Zepto, and Swiggy Instamart.
    Optional query param: items (comma-separated item names)
    """
    try:
        items_param = request.args.get('items', None)
        if items_param:
            items = [q.strip() for q in items_param.split(',')]
        else:
            items = DEFAULT_ITEMS
        
        comparisons = compare_prices(items)
        stats = get_price_stats()
        
        return jsonify({
            "comparisons": comparisons,
            "source": "live",
            "stats": stats,
            "items_searched": len(items),
            "items_found": len(comparisons),
        }), 200
        
    except Exception as e:
        print(f"❌ Price comparison error: {e}")
        return jsonify({
            "error": "Could not fetch prices",
            "detail": str(e),
        }), 500

@price_bp.route("/stats", methods=["GET"])
def price_stats():
    """Get aggregate price statistics"""
    try:
        stats = get_price_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
