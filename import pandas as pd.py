import pandas as pd

# Load the restaurant data from JSON
restaurants = pd.read_json("restaurants_list.json")

# Load the additional restaurant information from CSV
restaurant_info = pd.read_csv("restaurants_info.csv", sep=";")

# Inspect the datasets
print(restaurants.head())
print(restaurant_info.head())


# STEP 3: Validate restaurant IDs before merging

# Check the number of records in each file
print("JSON records:", len(restaurants))
print("CSV records:", len(restaurant_info))

# Check for duplicate IDs
print("Duplicate IDs in JSON:", restaurants["objectID"].duplicated().sum())
print("Duplicate IDs in CSV:", restaurant_info["objectID"].duplicated().sum())

# Find IDs that exist in JSON but not in CSV
missing_in_csv = set(restaurants["objectID"]) - set(restaurant_info["objectID"])

# Find IDs that exist in CSV but not in JSON
missing_in_json = set(restaurant_info["objectID"]) - set(restaurants["objectID"])

print("IDs missing from CSV:", len(missing_in_csv))
print("IDs missing from JSON:", len(missing_in_json))

# Final validation
if not missing_in_csv and not missing_in_json:
    print("SUCCESS: All restaurant IDs match!")
else:
    print("WARNING: Some restaurant IDs do not match!")
    print("Missing from CSV:", missing_in_csv)
    print("Missing from JSON:", missing_in_json)


# Inspect the structure of both datasets

print("\nJSON DATASET:")
restaurants.info()

print("\nCSV DATASET:")
restaurant_info.info()


# STEP 4: Validate restaurant ratings

invalid_ratings = restaurant_info[
    (restaurant_info["stars_count"] < 0) |
    (restaurant_info["stars_count"] > 5)
]

print("Restaurants with invalid ratings:", len(invalid_ratings))

print(invalid_ratings)


# STEP 6: Merge the datasets

merged_restaurants = pd.merge(
    restaurants,
    restaurant_info,
    on="objectID",
    how="left",
    validate="one_to_one"
)

print("Original JSON records:", len(restaurants))
print("Merged records:", len(merged_restaurants))


# STEP 7: Export merged data to JSON

merged_restaurants.to_json(
    "restaurants_merged.json",
    orient="records",
    indent=4,
    force_ascii=False
)

print("Merged JSON file created successfully!")


# Inspect several restaurant image URLs

for index, restaurant in restaurants.head(10).iterrows():
    print(restaurant["name"])
    print(restaurant["image_url"])
    print()




# Load the existing merged restaurant dataset
df = pd.read_json("restaurants_merged.json")

# Convert rating fields to numbers
df["stars_count"] = pd.to_numeric(df["stars_count"], errors="coerce")
df["reviews_count"] = pd.to_numeric(df["reviews_count"], errors="coerce")

# Calculate the dataset's average star rating
C = df["stars_count"].mean()

# Confidence weighting: 100 reviews
m = 100

# Calculate weighted rating
df["weighted_rating"] = (
    (df["reviews_count"] / (df["reviews_count"] + m)) * df["stars_count"]
    + (m / (df["reviews_count"] + m)) * C
).round(4)

# Export enriched records
df.to_json(
    "restaurants_weighted.json",
    orient="records",
    indent=4,
    force_ascii=False
)

print(f"Dataset average rating: {C:.2f}")
print(f"Total restaurants: {len(df)}")

print(
    df[["name", "stars_count", "reviews_count", "weighted_rating"]]
    .head(10)
)