# backend/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

def train():
    # 1. Load the dataset
    try:
        df = pd.read_csv('kyc_data.csv')
    except FileNotFoundError:
        print("❌ Error: kyc_data.csv not found. Please run create_dataset.py first.")
        return

    # 2. Define features (X) and target (y)
    features = ['name_match_score', 'is_duplicate', 'is_doc_valid']
    X = df[features]
    y = df['is_fraud']

    # 3. Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Initialize and train the model
    model = LogisticRegression()
    model.fit(X_train, y_train)

    # 5. Evaluate the model (optional, but good practice)
    y_pred = model.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")

    # 6. Save the trained model to a file
    joblib.dump(model, 'fraud_model.joblib')
    print("✅ Model trained and saved to fraud_model.joblib")

if __name__ == '__main__':
    train()