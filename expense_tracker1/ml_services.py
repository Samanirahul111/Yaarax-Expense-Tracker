import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import OneClassSVM
from sklearn.linear_model import LinearRegression

# 1. Multinomial Naive Bayes - Category Prediction
# Dummy training data to bootstrap the model
INITIAL_DATA = [
    ("coffee starbucks cafe food lunch dinner restaurant eat meal grocery walmart target supermarket milk bread", "Food, Beverages and Groceries"),
    ("uber taxi lyft petrol gas commute car transit train bus subway", "Fuel"),
    ("netflix spotify hulu prime internet electricity water bill utility phone", "Utility & Bills"),
    ("flight hotel travel vacation resort trip airbnb stay", "Hotels, Motels, Resorts"),
    ("clothes shirt pants fashion apparel shoes dress jacket wear", "Clothing and Apparel"),
    ("repair maintenance plumber mechanic service fix clean", "Repair and Services"),
    ("furniture tv electronics phone home goods appliance laptop", "Durables and Home Goods"),
    ("friends family person gift friend party donate", "To People"),
    ("miscellaneous unknown other random", "Others")
]

def train_category_model():
    df = pd.DataFrame(INITIAL_DATA, columns=["description", "category"])
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english')),
        ('clf', MultinomialNB())
    ])
    pipeline.fit(df['description'], df['category'])
    return pipeline

category_model = train_category_model()

def predict_category(description: str):
    """Predicts expense category based on description."""
    if not description:
        return "Others"
    try:
        tfidf = category_model.named_steps['tfidf']
        X = tfidf.transform([description.lower()])
        if X.nnz == 0:
            return "Others"
        
        prediction = category_model.predict([description.lower()])
        return prediction[0]
    except Exception:
        return "Others"


# 2. Support Vector Machine (SVM) - Anomaly Detection
def detect_anomaly(historical_amounts, new_amount):
    """
    Detects if the new_amount is an anomaly compared to historical_amounts.
    historical_amounts should be a list of floats.
    """
    if len(historical_amounts) < 5:
        # Not enough data to confidently detect an anomaly
        return False
        
    try:
        model = OneClassSVM(nu=0.1, kernel="rbf", gamma=0.1)
        X = np.array(historical_amounts).reshape(-1, 1)
        model.fit(X)
        
        X_test = np.array([[new_amount]])
        prediction = model.predict(X_test)
        
        # prediction returns -1 for outliers and 1 for inliers
        return prediction[0] == -1
    except Exception:
        return False


# 3. Linear Regression - Budget Forecasting
def predict_next_month_budget(monthly_totals):
    """
    Predicts the next month's spending based on past monthly totals.
    monthly_totals should be a list of floats in chronological order.
    """
    if not monthly_totals:
        return 0
    if len(monthly_totals) < 2:
        return monthly_totals[-1]
        
    try:
        X = np.arange(len(monthly_totals)).reshape(-1, 1)
        y = np.array(monthly_totals)
        
        model = LinearRegression()
        model.fit(X, y)
        
        next_month_idx = np.array([[len(monthly_totals)]])
        prediction = model.predict(next_month_idx)
        return float(max(0, prediction[0]))
    except Exception:
        return sum(monthly_totals) / len(monthly_totals) # Fallback to average


# 4. Logistic Regression - Recurring Expense Detection
def detect_recurring(description: str):
    """
    Predicts if an expense is likely recurring based on its description.
    (Simplified logic for demonstration without historical frequency data).
    """
    recurring_keywords = ['netflix', 'spotify', 'rent', 'subscription', 'gym', 'bill', 'insurance', 'prime', 'membership']
    desc_lower = description.lower()
    for kw in recurring_keywords:
        if kw in desc_lower:
            return True
    return False
