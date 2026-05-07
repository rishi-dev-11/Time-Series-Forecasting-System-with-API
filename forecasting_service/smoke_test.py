from forecasting_service.config import CSV_PATH
from forecasting_service.data import load_sales_data
from forecasting_service.features import feature_columns, make_supervised_features


def main() -> None:
    data = load_sales_data(CSV_PATH)
    first_state = sorted(data["state"].unique())[0]
    state_df = data[data["state"] == first_state]
    features = make_supervised_features(state_df)
    print(
        {
            "rows": len(data),
            "states": data["state"].nunique(),
            "first_state": first_state,
            "feature_rows": len(features),
            "feature_count": len(feature_columns()),
        }
    )


if __name__ == "__main__":
    main()
