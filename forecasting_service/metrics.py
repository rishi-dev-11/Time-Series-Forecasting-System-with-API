from __future__ import annotations

import numpy as np
import pandas as pd


def regression_metrics(actual: pd.Series, predicted: pd.Series) -> dict[str, float]:
    y = actual.astype(float).to_numpy()
    yhat = predicted.astype(float).to_numpy()
    err = y - yhat
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err**2)))
    denom = np.where(np.abs(y) < 1e-8, np.nan, np.abs(y))
    mape = float(np.nanmean(np.abs(err) / denom) * 100)
    return {"mae": mae, "rmse": rmse, "mape": mape}

