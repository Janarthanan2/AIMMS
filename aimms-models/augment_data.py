import pandas as pd
import random
from datetime import datetime, timedelta

def generate_date():
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2025, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    return random_date.strftime("%Y-%m-%d")

def augment_data(input_file, output_file):
    try:
        df = pd.read_csv(input_file)
        print(f"Original dataset size: {len(df)}")
        
        new_rows = []
        
        # Templates for augmentation
        templates = {
            'Rent': [
                ('House Rent {month}', 'House Rent', 20000.0),
                ('Flat Rent {month}', 'Landlord', 18000.0),
                ('PG Rent {month}', 'Stanza Living', 8000.0),
                ('Rent Payment', 'Owner', 22000.0),
                ('Monthly Rent', 'NoBroker', 19500.0),
                ('Maintenance Charge', 'Association', 2000.0),
            ],
            'Bills': [
                ('Mobile Recharge', 'Jio', 299.0),
                ('Postpaid Bill', 'Airtel', 499.0),
                ('Electricity Bill', 'TNEB', 1200.0),
                ('Water Tax', 'CMWSSB', 150.0),
                ('Gas Cylinder', 'Indane', 1100.0),
                ('Broadband Bill', 'ACT Fibernet', 1049.0),
                ('Credit Card Bill', 'HDFC Bank', 5000.0),
            ],
            'Miscellaneous': [
                ('UPI to Friend', 'UPI', 500.0),
                ('Charity Donation', 'Charity', 1000.0),
                ('Gift Purchase', 'Archies', 450.0),
                ('Stationery', 'Local Shop', 120.0),
                ('Printout', 'Xerox Shop', 50.0),
                ('Courier Charges', 'DTDC', 100.0),
                ('Repair Services', 'Urban Company', 400.0),
            ],
            'Entertainment': [
                ('Movie Ticket', 'BookMyShow', 300.0),
                ('Concert Ticket', 'Insider', 1500.0),
                ('Gaming Currency', 'Steam', 500.0),
                ('Amusement Park', 'Wonderla', 1200.0),
                ('Bowling', 'Amoeba', 400.0),
                ('Streaming Sub', 'Netflix', 199.0),
            ],
            'Health': [
                ('Doctor Consultation', 'Practo', 500.0),
                ('Lab Test', 'Thyrocare', 1200.0),
                ('Medicines', 'Apollo', 350.0),
                ('Gym Supplement', 'HealthKart', 2500.0),
                ('Dental Checkup', 'Clove Dental', 800.0),
            ]
        }
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Generate 150 samples for each target category
        target_categories = ['Rent', 'Bills', 'Miscellaneous', 'Entertainment', 'Health']
        
        for category in target_categories:
            current_count = len(df[df['category'] == category])
            needed = max(0, 200 - current_count)
            print(f"Generating {needed} rows for {category}...")
            
            for _ in range(needed):
                desc_template, merchant, base_amount = random.choice(templates[category])
                
                # Randomize description
                if '{month}' in desc_template:
                    desc = desc_template.format(month=random.choice(months))
                else:
                    desc = desc_template + " " + str(random.randint(100, 999))
                
                # Randomize amount slightly
                amount = round(base_amount * random.uniform(0.9, 1.1), 2)
                
                new_rows.append({
                    'date': generate_date(),
                    'description': desc,
                    'merchant': merchant,
                    'amount': amount,
                    'category': category
                })
                
        new_df = pd.DataFrame(new_rows)
        final_df = pd.concat([df, new_df], ignore_index=True)
        
        # Shuffle dataset
        final_df = final_df.sample(frac=1).reset_index(drop=True)
        
        final_df.to_csv(output_file, index=False)
        print(f"Augmented dataset saved to {output_file}")
        print(f"New total records: {len(final_df)}")
        print(final_df['category'].value_counts())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    augment_data('sample_dataset.csv', 'augmented_dataset.csv')
