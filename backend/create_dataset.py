# backend/create_dataset.py
import pandas as pd
import numpy as np

# Number of samples to generate
NUM_SAMPLES = 2000

def generate_data():
    data = []
    for _ in range(NUM_SAMPLES):
        # Generate features
        name_match_score = np.random.randint(50, 101)
        is_duplicate = np.random.choice([0, 1], p=[0.95, 0.05]) # 5% are duplicates
        is_doc_valid = np.random.choice([1, 0], p=[0.9, 0.1]) # 10% are invalid docs
        
        # Determine the label (is_fraud) based on rules to make the data realistic
        is_fraud = 0
        if is_duplicate == 1:
            is_fraud = 1
            name_match_score = np.random.randint(60, 85)
        elif is_doc_valid == 0:
            is_fraud = np.random.choice([1, 0], p=[0.7, 0.3])
        elif name_match_score < 85:
            is_fraud = np.random.choice([1, 0], p=[0.4, 0.6])

        data.append([name_match_score, is_duplicate, is_doc_valid, is_fraud])

    # Create a DataFrame and save to CSV
    df = pd.DataFrame(data, columns=['name_match_score', 'is_duplicate', 'is_doc_valid', 'is_fraud'])
    df.to_csv('kyc_data.csv', index=False)
    print("✅ Generated kyc_data.csv successfully.")

if __name__ == '__main__':
    generate_data()