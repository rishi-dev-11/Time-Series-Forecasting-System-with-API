from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd

from forecasting_service.features import feature_columns, make_supervised_features


@dataclass
class ForecastResult:
    dates: list[pd.Timestamp]
    predictions: list[float]

    def to_frame(self) -> pd.DataFrame:
        return pd.DataFrame({"date": self.dates, "prediction": self.predictions})


class BaseForecaster:
    name = "base"

    def fit(self, history: pd.DataFrame) -> "BaseForecaster":
        raise NotImplementedError

    def predict(self, history: pd.DataFrame, horizon: int) -> ForecastResult:
        raise NotImplementedError


class ArimaForecaster(BaseForecaster):
    name = "sarima"

    def __init__(self, order=(1, 1, 1), seasonal_order=(1, 1, 1, 52)):
        self.order = order
        self.seasonal_order = seasonal_order
        self.result = None

    def fit(self, history: pd.DataFrame) -> "ArimaForecaster":
        from statsmodels.tsa.statespace.sarimax import SARIMAX

        series = history.sort_values("date").set_index("date")["sales"].asfreq("W-SAT")
        model = SARIMAX(
            series,
            order=self.order,
            seasonal_order=self.seasonal_order,
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        self.result = model.fit(disp=False)
        return self

    def predict(self, history: pd.DataFrame, horizon: int) -> ForecastResult:
        if self.result is None:
            raise RuntimeError("Model must be fitted before prediction.")
        start = history["date"].max() + pd.Timedelta(weeks=1)
        dates = list(pd.date_range(start, periods=horizon, freq="W-SAT"))
        preds = self.result.forecast(steps=horizon).clip(lower=0).tolist()
        return ForecastResult(dates=dates, predictions=[float(x) for x in preds])


class ProphetForecaster(BaseForecaster):
    name = "prophet"

    def __init__(self):
        self.model = None

    # def fit(self, history: pd.DataFrame) -> "ProphetForecaster":
    #     from prophet import Prophet

    #     train = history.rename(columns={"date": "ds", "sales": "y"})[["ds", "y"]]
    #     train = train.loc[:, ~train.columns.duplicated()].copy()
    #     train = train.drop_duplicates(subset=["ds"])
    #     model = Prophet(
    #         yearly_seasonality=True,
    #         weekly_seasonality=False,
    #         daily_seasonality=False,
    #         seasonality_mode="multiplicative",
    #         changepoint_prior_scale=0.1,
    #         seasonality_prior_scale=10.0,
    #         holidays_prior_scale=10.0,
    #         interval_width=0.95,
    #     )
    #     model.add_seasonality(name="monthly", period=30.5, fourier_order=5,)
    #     model.fit(train)
    #     self.model = model
    #     return self

    def fit(self, history: pd.DataFrame) -> "ProphetForecaster":
        from prophet import Prophet

        if history.empty:
            raise ValueError("History dataframe is empty.")

        required_columns = {"date", "sales"}

        missing = required_columns - set(history.columns)

        if missing:
            raise ValueError(
                f"Missing required columns for Prophet: {missing}"
            )

        train = (
            history[["date", "sales"]]
            .rename(columns={"date": "ds", "sales": "y"})
            .copy()
        )

        # ------------------------------------------------------------------
        # STRICT TYPE NORMALIZATION
        # ------------------------------------------------------------------

        train["ds"] = pd.to_datetime(
            train["ds"],
            errors="coerce",
        )

        train["y"] = pd.to_numeric(
            train["y"],
            errors="coerce",
        )

        # ------------------------------------------------------------------
        # REMOVE INVALID ROWS
        # ------------------------------------------------------------------

        train = train.dropna(subset=["ds", "y"])

        # ------------------------------------------------------------------
        # REMOVE TIMEZONE INFO
        # Prophet behaves inconsistently with mixed tz-aware timestamps
        # ------------------------------------------------------------------

        if pd.api.types.is_datetime64tz_dtype(train["ds"]):
            train["ds"] = train["ds"].dt.tz_localize(None)

        # ------------------------------------------------------------------
        # SORT CHRONOLOGICALLY
        # ------------------------------------------------------------------

        train = train.sort_values("ds")

        # ------------------------------------------------------------------
        # RESET INDEX BEFORE ANY REINDEX OPERATION
        # VERY IMPORTANT FOR PROPHET INTERNALS
        # ------------------------------------------------------------------

        train = train.reset_index(drop=True)

        # ------------------------------------------------------------------
        # HANDLE DUPLICATE TIMESTAMPS
        #
        # Production-safe approach:
        # Aggregate duplicates instead of blindly dropping rows.
        # ------------------------------------------------------------------

        train = (
            train.groupby("ds", as_index=False)
            .agg({"y": "sum"})
        )

        # ------------------------------------------------------------------
        # FINAL VALIDATION
        # ------------------------------------------------------------------

        if train["ds"].duplicated().any():
            duplicates = train.loc[
                train["ds"].duplicated(),
                "ds",
            ].tolist()

            raise ValueError(
                f"Duplicate timestamps still exist: {duplicates[:5]}"
            )

        if len(train) < 20:
            raise ValueError(
                "Insufficient cleaned rows for Prophet training."
            )

        # ------------------------------------------------------------------
        # MODEL
        # ------------------------------------------------------------------

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode="multiplicative",
            changepoint_prior_scale=0.1,
            seasonality_prior_scale=10.0,
            holidays_prior_scale=10.0,
            interval_width=0.95,
        )

        model.add_seasonality(
            name="monthly",
            period=30.5,
            fourier_order=5,
        )

        model.fit(train)

        self.model = model

        return self

    def predict(self, history: pd.DataFrame, horizon: int) -> ForecastResult:
        if self.model is None:
            raise RuntimeError("Model must be fitted before prediction.")
        future = self.model.make_future_dataframe(periods=horizon, freq="W-SAT")
        forecast = self.model.predict(future).tail(horizon)
        return ForecastResult(
            dates=list(forecast["ds"]),
            predictions=forecast["yhat"].clip(lower=0).astype(float).tolist(),
        )


class XGBoostForecaster(BaseForecaster):
    name = "xgboost"

    def __init__(self):
        self.model = None
        self.columns = feature_columns()

    def fit(self, history: pd.DataFrame) -> "XGBoostForecaster":
        from xgboost import XGBRegressor

        train = make_supervised_features(history)
        self.model = XGBRegressor(
            n_estimators=800,
            max_depth=6,
            learning_rate=0.02,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            objective="reg:squarederror",
            random_state=42,
        )
        self.model.fit(train[self.columns], train["sales"], verbose=False)
        return self

    def predict(self, history: pd.DataFrame, horizon: int) -> ForecastResult:
        if self.model is None:
            raise RuntimeError("Model must be fitted before prediction.")
        working = history[["date", "sales"]].sort_values("date").copy()
        dates: list[pd.Timestamp] = []
        preds: list[float] = []
        for _ in range(horizon):
            next_date = working["date"].max() + pd.Timedelta(weeks=1)
            candidate = pd.concat(
                [working, pd.DataFrame([{"date": next_date, "sales": np.nan}])],
                ignore_index=True,
            )
            row = make_supervised_features(candidate).tail(1)
            pred = float(max(self.model.predict(row[self.columns])[0], 0.0))
            dates.append(next_date)
            preds.append(pred)
            working.loc[len(working)] = [next_date, pred]
        return ForecastResult(dates=dates, predictions=preds)


class LstmForecaster(BaseForecaster):
    name = "lstm"

    def __init__(self, sequence_length: int = 30, epochs: int = 20):
        self.sequence_length = sequence_length
        self.epochs = epochs
        self.model = None
        self.min_value = 0.0
        self.max_value = 1.0
        self.model_path: str | None = None

    def _scale(self, values: np.ndarray) -> np.ndarray:
        width = max(self.max_value - self.min_value, 1.0)
        return (values - self.min_value) / width

    def _inverse_scale(self, values: np.ndarray) -> np.ndarray:
        return values * max(self.max_value - self.min_value, 1.0) + self.min_value

    def fit(self, history: pd.DataFrame) -> "LstmForecaster":
        from tensorflow.keras.layers import LSTM, Dense, Input, Dropout
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.callbacks import EarlyStopping

        values = history.sort_values("date")["sales"].astype(float).to_numpy()
        self.min_value = float(values.min())
        self.max_value = float(values.max())
        scaled = self._scale(values)
        x, y = [], []
        for idx in range(self.sequence_length, len(scaled)):
            x.append(scaled[idx - self.sequence_length : idx])
            y.append(scaled[idx])
        x_arr = np.array(x).reshape((-1, self.sequence_length, 1))
        y_arr = np.array(y)
        # model = Sequential(
        #     [
        #         Input(shape=(self.sequence_length, 1)),
        #         LSTM(48, activation="tanh"),
        #         Dense(16, activation="relu"),
        #         Dense(1),
        #     ]
        # )
        model = Sequential(
            [
                Input(shape=(self.sequence_length, 1)),

                LSTM(
                    64,
                    activation="tanh",
                    return_sequences=False,
                ),

                Dropout(0.2),

                Dense(32, activation="relu"),

                Dense(1),
            ]
        )

        model.compile(optimizer="adam", loss="mse")
        early_stopping = EarlyStopping(monitor="loss", patience=5, restore_best_weights=True,)
        model.fit(x_arr, y_arr, epochs=self.epochs, batch_size=16, verbose=0, callbacks=[early_stopping])
        self.model = model
        return self

    def predict(self, history: pd.DataFrame, horizon: int) -> ForecastResult:
        if self.model is None:
            self._load_model()
        if self.model is None:
            raise RuntimeError("Model must be fitted before prediction.")
        ordered = history.sort_values("date")
        values = ordered["sales"].astype(float).to_numpy()
        window = list(self._scale(values)[-self.sequence_length :])
        dates: list[pd.Timestamp] = []
        preds: list[float] = []
        next_date = ordered["date"].max()
        for _ in range(horizon):
            x = np.array(window[-self.sequence_length:]).reshape((1, self.sequence_length, 1))
            scaled_pred = float(self.model.predict(x, verbose=0)[0][0])
            pred = float(max(self._inverse_scale(np.array([scaled_pred]))[0], 0.0))
            next_date = next_date + pd.Timedelta(weeks=1)
            dates.append(next_date)
            preds.append(pred)
            window.append(self._scale(np.array([pred]))[0])
        return ForecastResult(dates=dates, predictions=preds)

    def save_keras_model(self, path: Path) -> None:
        if self.model is not None:
            self.model.save(path)
            self.model_path = str(path)

    def _load_model(self) -> None:
        if not self.model_path:
            return
        from tensorflow.keras.models import load_model

        self.model = load_model(self.model_path)

    def __getstate__(self):
        state = self.__dict__.copy()
        state["model"] = None
        return state


def candidate_models(lstm_epochs: int = 20) -> list[BaseForecaster]:
    return [
        ArimaForecaster(),
        ProphetForecaster(),
        XGBoostForecaster(),
        LstmForecaster(epochs=lstm_epochs),
    ]
