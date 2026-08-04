import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

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

df = pd.DataFrame(INITIAL_DATA, columns=["description", "category"])
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', MultinomialNB())
])
pipeline.fit(df['description'], df['category'])

def predict_category(desc):
    if not desc:
        return "Others"
    try:
        tfidf = pipeline.named_steps['tfidf']
        X = tfidf.transform([desc.lower()])
        if X.nnz == 0:
            return "Others"
        return pipeline.predict([desc.lower()])[0]
    except Exception:
        return "Others"

print("book:", predict_category("book"))
print("doctor:", predict_category("doctor"))
print("movie:", predict_category("movie"))
print("toy:", predict_category("toy"))
print("petrol:", predict_category("petrol"))
print("hotel:", predict_category("hotel"))
