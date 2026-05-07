# from __future__ import annotations

# import numpy as np
# import pandas as pd


# LAG_WEEKS = [1, 7, 30]
# ROLLING_WINDOWS = [4, 8, 12]


# def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
#     out = df.copy()
#     out["day_of_week"] = out["date"].dt.dayofweek
#     out["month"] = out["date"].dt.month
#     out["week_of_year"] = out["date"].dt.isocalendar().week.astype(int)
#     out["quarter"] = out["date"].dt.quarter
#     out["month_sin"] = np.sin(2 * np.pi * out["month"] / 12)
#     out["month_cos"] = np.cos(2 * np.pi * out["month"] / 12)
#     out["week_sin"] = np.sin(2 * np.pi * out["week_of_year"] / 52)
#     out["week_cos"] = np.cos(2 * np.pi * out["week_of_year"] / 52)
#     out["is_month_start"] = out["date"].dt.is_month_start.astype(int)
#     out["is_month_end"] = out["date"].dt.is_month_end.astype(int)
#     out["holiday_flag"] = _holiday_flag(out["date"])
#     out["time_idx"] = np.arange(len(out))
#     return out


# def _holiday_flag(dates: pd.Series) -> np.ndarray:
#     try:
#         import holidays

#         years = sorted(dates.dt.year.dropna().unique().tolist())
#         us_holidays = holidays.US(years=years)
#         return dates.dt.date.map(lambda d: int(d in us_holidays)).to_numpy()
#     except Exception:
#         # Fallback keeps the pipeline runnable without optional holiday package.
#         return dates.dt.month.isin([1, 7, 11, 12]).astype(int).to_numpy()


# def make_supervised_features(df: pd.DataFrame) -> pd.DataFrame:
#     out = add_calendar_features(df)
#     for lag in LAG_WEEKS:
#         out[f"lag_{lag}"] = out["sales"].shift(lag)
#     for window in ROLLING_WINDOWS:
#         shifted = out["sales"].shift(1)
#         out[f"rolling_mean_{window}"] = shifted.rolling(window).mean()
#         out[f"rolling_std_{window}"] = shifted.rolling(window).std()
#     return out.dropna(subset=feature_columns()).reset_index(drop=True)


# def feature_columns() -> list[str]:
#     cols = [
#         "day_of_week",
#         "month",
#         "week_of_year",
#         "quarter",
#         "month_sin",
#         "month_cos",
#         "week_sin",
#         "week_cos",
#         "is_month_start",
#         "is_month_end",
#         "holiday_flag",
#         "time_idx",
#     ]
#     cols += [f"lag_{lag}" for lag in LAG_WEEKS]
#     for window in ROLLING_WINDOWS:
#         cols += [f"rolling_mean_{window}", f"rolling_std_{window}"]
#     return cols


# def build_future_feature_frame(history: pd.DataFrame, horizon: int) -> pd.DataFrame:
#     """Recursive feature creation for ML models that need lagged future rows."""
#     working = history[["date", "sales"]].sort_values("date").copy()
#     forecasts: list[dict[str, object]] = []
#     for _ in range(horizon):
#         next_date = working["date"].max() + pd.Timedelta(weeks=1)
#         candidate = pd.concat(
#             [working, pd.DataFrame([{"date": next_date, "sales": np.nan}])],
#             ignore_index=True,
#         )
#         row = make_supervised_features(candidate).tail(1)
#         forecasts.append({"date": next_date, "features": row[feature_columns()]})
#         working.loc[len(working)] = [next_date, 0.0]
#     return pd.DataFrame(forecasts)



from __future__ import annotations

import numpy as np
import pandas as pd


LAG_WEEKS = [1, 7, 30]

ROLLING_WINDOWS = [4, 8, 12]


def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:

    out = df.copy()

    out["day_of_week"] = out["date"].dt.dayofweek

    out["month"] = out["date"].dt.month

    out["week_of_year"] = (
        out["date"]
        .dt
        .isocalendar()
        .week
        .astype(int)
    )

    out["quarter"] = out["date"].dt.quarter

    # Cyclical month encoding
    out["month_sin"] = np.sin(
        2 * np.pi * out["month"] / 12
    )

    out["month_cos"] = np.cos(
        2 * np.pi * out["month"] / 12
    )

    # Cyclical week encoding
    out["week_sin"] = np.sin(
        2 * np.pi * out["week_of_year"] / 52
    )

    out["week_cos"] = np.cos(
        2 * np.pi * out["week_of_year"] / 52
    )

    out["is_month_start"] = (
        out["date"]
        .dt
        .is_month_start
        .astype(int)
    )

    out["is_month_end"] = (
        out["date"]
        .dt
        .is_month_end
        .astype(int)
    )

    out["holiday_flag"] = _holiday_flag(
        out["date"]
    )

    # Sequential trend index
    out["time_idx"] = np.arange(len(out))

    # Non-linear trend support
    out["time_idx_squared"] = (
        out["time_idx"] ** 2
    )

    # Normalized trend progression
    if len(out) > 1:
        out["normalized_time"] = (
            out["time_idx"] / out["time_idx"].max()
        )
    else:
        out["normalized_time"] = 0.0

    return out


def _holiday_flag(dates: pd.Series) -> np.ndarray:

    try:

        import holidays

        years = sorted(
            dates
            .dt
            .year
            .dropna()
            .unique()
            .tolist()
        )

        us_holidays = holidays.US(years=years)

        return (
            dates
            .dt
            .date
            .map(lambda d: int(d in us_holidays))
            .to_numpy()
        )

    except Exception:

        # Safe fallback
        return (
            dates
            .dt
            .month
            .isin([1, 7, 11, 12])
            .astype(int)
            .to_numpy()
        )


def make_supervised_features(
    df: pd.DataFrame
) -> pd.DataFrame:

    out = add_calendar_features(df)

    # Lag Features
    for lag in LAG_WEEKS:

        out[f"lag_{lag}"] = (
            out["sales"].shift(lag)
        )

    shifted = out["sales"].shift(1)

    # Rolling Statistics
    for window in ROLLING_WINDOWS:

        out[f"rolling_mean_{window}"] = (
            shifted
            .rolling(window)
            .mean()
        )

        out[f"rolling_std_{window}"] = (
            shifted
            .rolling(window)
            .std()
        )

    # Difference / Momentum Features
    out["diff_1"] = (
        out["sales"].diff(1)
    )

    out["diff_7"] = (
        out["sales"].diff(7)
    )

    # Exponential Moving Averages
    out["ema_4"] = (
        shifted
        .ewm(span=4, adjust=False)
        .mean()
    )

    out["ema_12"] = (
        shifted
        .ewm(span=12, adjust=False)
        .mean()
    )

    # Trend Strength
    out["trend_strength"] = (
        out["rolling_mean_4"] -
        out["rolling_mean_12"]
    )

    return (
        out
        .dropna(subset=feature_columns())
        .reset_index(drop=True)
    )


def feature_columns() -> list[str]:

    cols = [

        "day_of_week",
        "month",
        "week_of_year",
        "quarter",

        "month_sin",
        "month_cos",

        "week_sin",
        "week_cos",

        "is_month_start",
        "is_month_end",

        "holiday_flag",

        "time_idx",
        "time_idx_squared",
        "normalized_time",

        "diff_1",
        "diff_7",

        "ema_4",
        "ema_12",

        "trend_strength",
    ]

    # Lag Features
    cols += [
        f"lag_{lag}"
        for lag in LAG_WEEKS
    ]

    # Rolling Features
    for window in ROLLING_WINDOWS:

        cols += [
            f"rolling_mean_{window}",
            f"rolling_std_{window}",
        ]

    return cols


def build_future_feature_frame(
    history: pd.DataFrame,
    horizon: int
) -> pd.DataFrame:
    """
    Recursive feature generation
    for ML forecasting models.
    """

    working = (
        history[["date", "sales"]]
        .sort_values("date")
        .copy()
    )

    forecasts: list[dict[str, object]] = []

    for _ in range(horizon):

        next_date = (
            working["date"].max() +
            pd.Timedelta(weeks=1)
        )

        candidate = pd.concat(
            [
                working,
                pd.DataFrame(
                    [{
                        "date": next_date,
                        "sales": np.nan
                    }]
                ),
            ],
            ignore_index=True,
        )

        row = (
            make_supervised_features(candidate)
            .tail(1)
        )

        forecasts.append(
            {
                "date": next_date,
                "features": row[feature_columns()],
            }
        )

        # Temporary placeholder.
        # Actual recursive prediction
        # should overwrite this later.
        working.loc[len(working)] = [
            next_date,
            working["sales"].iloc[-1]
        ]

    return pd.DataFrame(forecasts)