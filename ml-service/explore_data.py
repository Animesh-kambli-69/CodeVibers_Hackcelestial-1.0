import pandas as pd
import numpy as np

def load_hotel_data():
    """
    Loads and combines H1.csv (Resort Hotel) and H2.csv (City Hotel) datasets.
    Handles extra whitespace and string 'NULL' values.
    """
    print("Loading H1.csv (Resort Hotel) and H2.csv (City Hotel)...")
    
    # Load datasets with trailing whitespace stripping and NULL value handling
    df_h1 = pd.read_csv("data/raw/H1.csv", skipinitialspace=True, na_values=["NULL", "NULL ", " NULL"])
    df_h2 = pd.read_csv("data/raw/H2.csv", skipinitialspace=True, na_values=["NULL", "NULL ", " NULL"])
    
    # Label the hotel types
    df_h1["hotel"] = "Resort Hotel"
    df_h2["hotel"] = "City Hotel"
    
    # Combine datasets
    df = pd.concat([df_h1, df_h2], ignore_index=True)
    
    # Clean whitespace in string columns
    for col in df.columns:
        if df[col].dtype == "object" or df[col].dtype == "str" or str(df[col].dtype) == "string":
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace({'nan': np.nan, 'None': np.nan, 'NULL': np.nan})
        
    return df

if __name__ == "__main__":
    df = load_hotel_data()
    
    print("\n--- 1. DATASET SHAPE ---")
    print(f"Total Rows: {df.shape[0]:,}")
    print(f"Total Columns: {df.shape[1]}")
    
    print("\n--- 2. COLUMNS LIST ---")
    print(list(df.columns))
    
    print("\n--- 3. FIRST 5 ROWS ---")
    print(df.head())
    
    print("\n--- 4. DATASET INFO ---")
    df.info()
    
    print("\n--- 5. MISSING VALUES ---")
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    print(missing)
    
    print("\n--- 6. TARGET DISTRIBUTION (IsCanceled) ---")
    print(df["IsCanceled"].value_counts(normalize=True).map("{:.2%}".format))
