import math

# Category keyword map
CATEGORY_KEYWORDS = {
    "Food & Dining": ["coffee", "starbucks", "cafe", "food", "lunch", "dinner", "restaurant", "eat", "meal", "zomato", "swiggy", "pizza", "burger"],
    "Groceries": ["grocery", "walmart", "supermarket", "milk", "bread"],
    "Transportation": ["uber", "taxi", "petrol", "gas", "commute", "car", "transit", "train", "bus", "subway", "rapido", "ola", "autorickshaw", "fuel"],
    "Utilities": ["netflix", "spotify", "prime", "internet", "electricity", "water", "bill", "utility", "phone", "jio", "airtel", "bsnl", "vodafone"],
    "Travel": ["flight", "hotel", "travel", "vacation", "resort", "trip", "airbnb", "stay", "oyo"],
    "Shopping": ["clothes", "shirt", "pants", "fashion", "apparel", "shoes", "dress", "jacket", "myntra", "ajio", "zara", "amazon", "flipkart", "electronics", "phone", "laptop"],
    "Housing": ["rent", "furniture", "home", "appliance", "repair", "maintenance", "plumber", "mechanic", "service", "fix", "clean"],
    "Miscellaneous": ["family", "gift", "friend", "party", "donate", "gpay", "paytm", "phonepe", "transfer"],
}

def predict_category(description: str) -> str:
    if not description:
        return "Miscellaneous"
    desc_lower = description.lower()
    best_category = "Miscellaneous"
    best_score = 0
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in desc_lower)
        if score > best_score:
            best_score = score
            best_category = category
    return best_category


def _mean(values):
    return sum(values) / len(values) if values else 0


def _std(values):
    if len(values) < 2:
        return 0
    m = _mean(values)
    variance = sum((x - m) ** 2 for x in values) / len(values)
    return math.sqrt(variance)


def detect_anomaly(historical_amounts, new_amount) -> bool:
    if len(historical_amounts) < 5:
        return False
    try:
        m = _mean(historical_amounts)
        s = _std(historical_amounts)
        if s == 0:
            return False
        z_score = abs((new_amount - m) / s)
        return z_score > 2.5
    except Exception:
        return False


def predict_next_month_budget(monthly_totals) -> float:
    if not monthly_totals:
        return 0
    if len(monthly_totals) < 2:
        return float(monthly_totals[-1])
    try:
        n = len(monthly_totals)
        x = list(range(n))
        x_mean = _mean(x)
        y_mean = _mean(monthly_totals)
        numerator = sum((x[i] - x_mean) * (monthly_totals[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        if denominator == 0:
            return float(y_mean)
        slope = numerator / denominator
        intercept = y_mean - slope * x_mean
        prediction = slope * n + intercept
        return float(max(0, prediction))
    except Exception:
        return float(_mean(monthly_totals))


def detect_recurring(description: str) -> bool:
    recurring_keywords = ['netflix', 'spotify', 'rent', 'subscription', 'gym', 'bill',
                          'insurance', 'prime', 'membership', 'jio', 'airtel', 'vodafone', 'emi']
    desc_lower = description.lower()
    return any(kw in desc_lower for kw in recurring_keywords)
