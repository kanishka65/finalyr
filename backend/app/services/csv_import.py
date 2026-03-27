import pandas as pd
from dateutil import parser
from datetime import datetime
from app.extensions import mongo
def parse_purchase_csv(stream, owner_email):
    """
    stream: file-like object (uploaded CSV)
    Returns list of dicts ready for insertion (with 'user' field)
    """
    df = pd.read_csv(stream)
    # normalize expected columns if present
    expected = ["order_id","platform","item_name","category","quantity","unit_price",
                "delivery_fee","tip","total_amount","payment_method","order_datetime","tags","notes"]
    # keep only expected intersection
    cols = [c for c in expected if c in df.columns]
    df = df[cols].copy()
    # fill missing columns with defaults
    for c in expected:
        if c not in df.columns:
            df[c] = None

    # convert numeric fields
    for ncol in ["quantity","unit_price","delivery_fee","tip","total_amount"]:
        if ncol in df.columns:
            df[ncol] = pd.to_numeric(df[ncol], errors='coerce').fillna(0.0)

    # parse datetimes
    def parse_dt(x):
        try:
            return parser.parse(str(x))
        except Exception:
            return None

    df["order_datetime"] = df["order_datetime"].apply(parse_dt)

    records = df.to_dict(orient="records")
    # attach user, tidy each record
    out = []
    for r in records:
        # ensure order_datetime is python datetime object (pandas may give Timestamp)
        dt = r.get("order_datetime")
        if hasattr(dt, "to_pydatetime"):
            dt = dt.to_pydatetime()
        r["order_datetime"] = dt
        r["user"] = owner_email
        out.append(r)
    return out

def parse_upi_csv(stream, owner_email):
    """
    Parses a UPI statement (CSV) and attempts to extract Q-commerce purchases.
    Merchant detection for Blinkit, Zepto, Swiggy, etc.
    """
    try:
        df = pd.read_csv(stream)
        
        # Q-commerce merchant mapping (Partial string match)
        merchants = {
            "BLINKIT": "Blinkit",
            "ZEPTONOW": "Zepto",
            "BUNDL": "Swiggy Instamart", # BUNDL TECHNOLOGIES is Swiggy
            "SWIGGY": "Swiggy Instamart",
            "BIGBASKET": "BigBasket"
        }
        
        extracted_purchases = []
        
        # Standard UPI CSV columns often vary, so we search for 'Description' or 'Merchant'
        potential_desc_cols = ['Description', 'Narration', 'Transaction Note', 'Merchant']
        desc_col = next((c for c in potential_desc_cols if c in df.columns), None)
        
        potential_amt_cols = ['Amount', 'Debit', 'Transaction Amount']
        amt_col = next((c for c in potential_amt_cols if c in df.columns), None)
        
        potential_date_cols = ['Date', 'Transaction Date']
        date_col = next((c for c in potential_date_cols if c in df.columns), None)

        if not desc_col or not amt_col:
            print("Could not find standard UPI columns in CSV")
            return []

        for _, row in df.iterrows():
            narration = str(row[desc_col]).upper()
            platform = None
            
            for key, val in merchants.items():
                if key in narration:
                    platform = val
                    break
            
            if platform:
                # We found a Q-commerce transaction!
                # Note: UPI statements don't have item-level detail, so we tag as 'Bulk/UPI Payment'
                purchase = {
                    "item_name": f"UPI Order - {platform}",
                    "platform": platform,
                    "category": "Uncategorized (UPI)",
                    "quantity": 1,
                    "unit_price": float(row[amt_col]),
                    "total_amount": float(row[amt_col]),
                    "order_datetime": parser.parse(str(row[date_col])) if date_col else datetime.now(),
                    "user": owner_email,
                    "notes": f"Auto-extracted from UPI statement: {row[desc_col]}"
                }
                extracted_purchases.append(purchase)
                
        return extracted_purchases
    except Exception as e:
        print(f"Error parsing UPI CSV: {e}")
        return []
