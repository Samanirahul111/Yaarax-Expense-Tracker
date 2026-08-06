import numpy as np

# Category keyword map - replaces MultinomialNB
CATEGORY_KEYWORDS = {
    "Food, Beverages and Groceries": ["coffee", "starbucks", "cafe", "food", "lunch", "dinner", "restaurant", "eat", "meal", "grocery", "walmart", "target", "supermarket", "milk", "bread", "zomato", "swiggy", "hotel", "pizza", "burger"],
    "Fuel": ["uber", "taxi", "lyft", "petrol", "gas", "commute", "car", "transit", "train", "bus", "subway", "rapido", "ola", "autorickshaw"],
    "Utility & Bills": ["netflix", "spotify", "hulu", "prime", "internet", "electricity", "water", "bill", "utility", "phone", "jio", "airtel", "bsnl", "vodafone"],
    "Hotels, Motels, Resorts": ["flight", "hotel", "travel", "vacation", "resort", "trip", "airbnb", "stay", "oyo", "makemytrip"],
    "Clothing and Apparel": ["clothes", "shirt", "pants", "fashion", "apparel", "shoes", "dress", "jacket", "wear", "myntra", "ajio", "zara", "h&m"],
    "Repair and Services": ["repair", "maintenance", "plumber", "mechanic", "service", "fix", "clean"],
    "Durables and Home Goods": ["furniture", "tv", "electronics", "phone", "home", "goods", "appliance", "laptop", "amazon", "flipkart"],
    "To People": ["friends", "family", "person", "gift", "friend", "party", "donate", "gpay", "paytm", "phonepe", "transfer"],
    "Others": [],
}


def predict_category(description: str) -> str:
    """Predicts expense category based on keywords."""
    if not description:
        return "Others"
    desc_lower = description.lower()
    best_category = "Others"
    best_score = 0
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in desc_lower)
        if score > best_score:
            best_score = score
            best_category = category
    return best_category


def detect_anomaly(historical_amounts, new_amount) -> bool:
    """Detects if new_amount is anomalous using Z-score (pure numpy)."""
    if len(historical_amounts) < 5:
        return False
    try:
        arr = np.array(historical_amounts, dtype=float)
        mean = np.mean(arr)
        std = np.std(arr)
        if std == 0:
            return False
        z_score = abs((new_amount - mean) / std)
        return z_score > 2.5  # More than 2.5 standard deviations = anomaly
    except Exception:
        return False


def predict_next_month_budget(monthly_totals) -> float:
    """Predicts next month using simple linear regression (pure numpy)."""
    if not monthly_totals:
        return 0
    if len(monthly_totals) < 2:
        return float(monthly_totals[-1])
    try:
        x = np.arange(len(monthly_totals), dtype=float)
        y = np.array(monthly_totals, dtype=float)
        # Least squares linear regression
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        slope = np.sum((x - x_mean) * (y - y_mean)) / np.sum((x - x_mean) ** 2)
        intercept = y_mean - slope * x_mean
        prediction = slope * len(monthly_totals) + intercept
        return float(max(0, prediction))
    except Exception:
        return float(sum(monthly_totals) / len(monthly_totals))


def detect_recurring(description: str) -> bool:
    """Predicts if an expense is likely recurring based on description."""
    recurring_keywords = ['netflix', 'spotify', 'rent', 'subscription', 'gym', 'bill',
                          'insurance', 'prime', 'membership', 'jio', 'airtel', 'vodafone', 'emi']
    desc_lower = description.lower()
    return any(kw in desc_lower for kw in recurring_keywords)
