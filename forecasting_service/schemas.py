from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd

from forecasting_service.models.forecasters import BaseForecaster


@dataclass
class StateModelBundle:
    state: str
    best_model_name: str
    best_model: BaseForecaster
    metrics: dict[str, dict[str, float]]
    failures: dict[str, str]
    last_history: pd.DataFrame
    forecast: pd.DataFrame