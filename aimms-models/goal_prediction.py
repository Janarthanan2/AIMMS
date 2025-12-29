import pandas as pd
from prophet import Prophet
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def predict_goal_completion(history, goal_target, goal_current, goal_deadline):
    """
    Predicts goal completion date using Facebook Prophet.
    
    Args:
        history (list): List of dicts containing transaction history.
                        Expected keys: 'date', 'amount', 'type' (Credit/Debit)
        goal_target (float): Target amount to reach.
        goal_current (float): Current saved amount.
        goal_deadline (str): Deadline in YYYY-MM-DD format.
        
    Returns:
        dict: Prediction results including date, daily savings, rules, etc.
    """
    try:
        if not history:
             return {
                "predicted_completion_date": None,
                "daily_savings_estimate": 0,
                "on_track": False,
                "suggested_daily_cut": 0,
                "message": "Insufficient data for prediction"
            }

        df = pd.DataFrame(history)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate daily savings: Credit (Income) - Debit (Expense)
        # We need to aggregate by day first
        df['amount'] = df.apply(lambda x: x['amount'] if x['type'] == 'Credit' else -x['amount'], axis=1)
        
        daily_df = df.groupby('date')['amount'].sum().reset_index()
        daily_df.columns = ['ds', 'y'] # Prophet requires 'ds' and 'y'
        
        # Check if we have enough data points. Prophet generally needs at least 2, preferably more.
        if len(daily_df) < 5:
             # Fallback: Simple average calculation if not enough data for Time Series
             avg_daily_savings = daily_df['y'].mean()
        else:
            # Initialize and fit Prophet model
            model = Prophet(daily_seasonality=True, yearly_seasonality=False, weekly_seasonality=True)
            model.fit(daily_df)
            
            # Forecast
            # We forecast for the duration between now and deadline + some buffer
            deadline_date = pd.to_datetime(goal_deadline)
            today = pd.Timestamp.now()
            days_to_deadline = (deadline_date - today).days
            
            if days_to_deadline < 1:
                days_to_deadline = 1 # Avoid negative or zero
            
            # Create future dataframe
            # We predict specifically into the future to find when cumulative savings hits target
            future = model.make_future_dataframe(periods=max(365, days_to_deadline + 100)) # Predict out 1 year or past deadline
            forecast = model.predict(future)
            
            # We need expected future daily savings. 
            # The 'yhat' is the predicted daily value.
            # We average the 'yhat' for the next 30 days to get "Current Trend"
            next_30_days = forecast[forecast['ds'] > today].head(30)
            avg_daily_savings = next_30_days['yhat'].mean()

        # Calculation
        remaining_amount = goal_target - goal_current
        
        if avg_daily_savings <= 0:
            predicted_days = float('inf')
        else:
            predicted_days = remaining_amount / avg_daily_savings
            
        today_date = datetime.now()
        
        if predicted_days == float('inf'):
            predicted_date = "Never (Negative or Zero Savings)"
            on_track = False
        else:
            completion_date = today_date + timedelta(days=predicted_days)
            predicted_date = completion_date.strftime("%Y-%m-%d")
            on_track = completion_date <= datetime.strptime(goal_deadline, "%Y-%m-%d")

        # Smart Recommendations
        suggested_cut = 0
        if not on_track:
            # Calculate required daily savings
            days_remaining = (datetime.strptime(goal_deadline, "%Y-%m-%d") - today_date).days
            if days_remaining > 0:
                required_daily_savings = remaining_amount / days_remaining
                suggested_cut = required_daily_savings - avg_daily_savings
                if suggested_cut < 0: suggested_cut = 0 # Should not happen if not on track, but safety
            else:
                 suggested_cut = remaining_amount # Deadline passed, need everything
        
        return {
            "predicted_completion_date": predicted_date,
            "daily_savings_estimate": round(avg_daily_savings, 2),
            "on_track": on_track,
            "suggested_daily_cut": round(suggested_cut, 2)
        }

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return {
            "predicted_completion_date": None,
            "daily_savings_estimate": 0,
            "on_track": False,
            "suggested_daily_cut": 0,
            "error": str(e)
        }
