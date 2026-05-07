from __future__ import annotations

from pathlib import Path

import pandas as pd


def _parse_sales(value: object) -> float:
    if pd.isna(value):
        return 0.0
    return float(str(value).replace(",", "").strip() or 0)


def _parse_dates(series: pd.Series) -> pd.Series:
    """
    Robust parser for mixed date formats.
    Supports:
    - MM/DD/YYYY
    - DD-MM-YYYY
    - YYYY-MM-DD
    """

    # clean strings
    series = series.astype(str).str.strip()

    # create empty datetime series
    parsed = pd.Series(pd.NaT, index=series.index)

    # format 1: MM/DD/YYYY
    mask = parsed.isna()
    parsed.loc[mask] = pd.to_datetime(
        series.loc[mask],
        format="%m/%d/%Y",
        errors="coerce"
    )

    # format 2: DD-MM-YYYY
    mask = parsed.isna()
    parsed.loc[mask] = pd.to_datetime(
        series.loc[mask],
        format="%d-%m-%Y",
        errors="coerce"
    )

    # format 3: YYYY-MM-DD
    mask = parsed.isna()
    parsed.loc[mask] = pd.to_datetime(
        series.loc[mask],
        format="%Y-%m-%d",
        errors="coerce"
    )

    # final generic fallback
    mask = parsed.isna()
    parsed.loc[mask] = pd.to_datetime(
        series.loc[mask],
        dayfirst=True,
        errors="coerce"
    )

    # check failures
    if parsed.isna().any():
        bad = series.loc[parsed.isna()].head(10).tolist()
        raise ValueError(f"Unable to parse date values: {bad}")

    return parsed

def load_sales_data(path: Path) -> pd.DataFrame:
    """Load, clean, aggregate, and regularize weekly state-level sales."""
    df = pd.read_csv(path)
    required = {"State", "Date", "Total"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing required columns: {sorted(missing)}")

    df = df.rename(columns={"State": "state", "Date": "date", "Total": "sales"})
    df["state"] = df["state"].astype(str).str.strip()
    df["date"] = _parse_dates(df["date"])
    df["sales"] = df["sales"].map(_parse_sales)

    weekly = (
        df.groupby(["state", "date"], as_index=False)["sales"]
        .sum()
        .sort_values(["state", "date"])
    )

    frames: list[pd.DataFrame] = []
    for state, state_df in weekly.groupby("state", sort=True):
        state_df = state_df.set_index("date").sort_index()
        full_index = pd.date_range(
            state_df.index.min(), state_df.index.max(), freq="W-SAT"
        )
        state_df = state_df.reindex(full_index)
        state_df["state"] = state
        state_df["sales"] = state_df["sales"].interpolate("time").ffill().bfill()
        state_df.index.name = "date"
        frames.append(state_df.reset_index())

    return pd.concat(frames, ignore_index=True)[["state", "date", "sales"]]


def train_validation_split(
    state_df: pd.DataFrame, validation_weeks: int
) -> tuple[pd.DataFrame, pd.DataFrame]:
    state_df = state_df.sort_values("date").reset_index(drop=True)
    if len(state_df) <= validation_weeks + 30:
        raise ValueError("Not enough history for lag features and validation split.")
    return state_df.iloc[:-validation_weeks].copy(), state_df.iloc[-validation_weeks:].copy()
