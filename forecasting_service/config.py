from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
CSV_PATH = BASE_DIR / "Forecasting Case- Study.xlsx - Sheet1.csv"
EXCEL_PATH = BASE_DIR / "Forecasting Case- Study.xlsx"
ARTIFACT_DIR = BASE_DIR / "forecasting_service" / "artifacts"
MODEL_REGISTRY_PATH = ARTIFACT_DIR / "model_registry.joblib"
FORECAST_HORIZON_WEEKS = 8
VALIDATION_WEEKS = 8
RANDOM_STATE = 42

