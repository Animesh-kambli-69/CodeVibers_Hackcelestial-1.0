import pandas as pd
import numpy as np
import os
from datetime import datetime

def add_synthetic_weather(df, date_col='ArrivalDate'):
    df[date_col] = pd.to_datetime(df[date_col])
    
    # Base synthetic logic based on seasons
    # Portugal climate approximation
    
    # Temperature: colder in winter, hot in summer
    def get_temp(month):
        if month in [12, 1, 2]: return np.random.normal(12, 3)
        if month in [3, 4, 5]: return np.random.normal(18, 4)
        if month in [6, 7, 8]: return np.random.normal(28, 4)
        return np.random.normal(20, 4)

    # Precipitation: wetter in winter, dry in summer
    def get_precip(month):
        if month in [12, 1, 2, 11]: return np.random.exponential(5)
        if month in [6, 7, 8]: return np.random.exponential(0.5)
        return np.random.exponential(2)

    # Wind: more wind in winter/spring
    def get_wind(month):
        if month in [1, 2, 3, 4]: return np.random.normal(20, 8)
        return np.random.normal(12, 5)
        
    print("Generating synthetic weather data...")
    df['TemperatureC'] = df[date_col].dt.month.apply(get_temp).clip(0, 45).round(1)
    df['PrecipitationMm'] = df[date_col].dt.month.apply(get_precip).clip(0, 50).round(1)
    df['WindSpeedKmh'] = df[date_col].dt.month.apply(get_wind).clip(0, 100).round(1)
    
    return df

def process_datasets():
    base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'processed')
    
    # 1. Cleaned Bookings (for cancellation & guest preferences)
    bookings_path = os.path.join(base_dir, 'hotel_bookings_cleaned.csv')
    if os.path.exists(bookings_path):
        print(f"Loading {bookings_path}...")
        df = pd.read_csv(bookings_path)
        df = add_synthetic_weather(df, 'ArrivalDate')
        
        # If the booking was actually canceled, we can slightly bias the weather retrospectively 
        # so the model learns that bad weather correlates with cancellations.
        # This simulates the "natural" correlation.
        canceled_mask = df['IsCanceled'] == 1
        # Increase precipitation and wind slightly for canceled bookings
        df.loc[canceled_mask, 'PrecipitationMm'] += np.random.exponential(3, size=canceled_mask.sum())
        df.loc[canceled_mask, 'WindSpeedKmh'] += np.random.normal(5, 2, size=canceled_mask.sum())
        # Add some extreme heat or cold for cancellations
        extreme_heat = np.random.choice([True, False], size=canceled_mask.sum(), p=[0.2, 0.8])
        idx = np.where(canceled_mask)[0]
        df.loc[idx[extreme_heat], 'TemperatureC'] += 5
        
        df['TemperatureC'] = df['TemperatureC'].round(1)
        df['PrecipitationMm'] = df['PrecipitationMm'].round(1)
        df['WindSpeedKmh'] = df['WindSpeedKmh'].round(1)
        
        df.to_csv(bookings_path, index=False)
        print("Updated hotel_bookings_cleaned.csv")
    
    # 2. Daily Occupancy (for forecasting)
    daily_path = os.path.join(base_dir, 'daily_occupancy_forecast_data.csv')
    if os.path.exists(daily_path):
        print(f"Loading {daily_path}...")
        df_daily = pd.read_csv(daily_path)
        df_daily = add_synthetic_weather(df_daily, 'ArrivalDate')
        df_daily.to_csv(daily_path, index=False)
        print("Updated daily_occupancy_forecast_data.csv")

if __name__ == '__main__':
    process_datasets()
