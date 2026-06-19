import os
import re
import glob
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error

app = FastAPI(
    title="Agromonitor ML Service",
    description="Layanan Mikro berbasis Python untuk pemodelan prediksi deret waktu dengan ARIMA",
    version="1.0.0"
)

# Allow CORS for ease of integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../storage"))
CONFIG_PATH = os.path.join(STORAGE_DIR, "arima_config.json")

def get_arima_order(slug: str):
    # Default parameters
    p, d, q = 5, 1, 0
    confidence = 95
    if os.path.exists(CONFIG_PATH):
        try:
            import json
            with open(CONFIG_PATH, 'r') as f:
                config = json.load(f)
                if slug in config:
                    c = config[slug]
                    p = int(c.get('p', 5))
                    d = int(c.get('d', 1))
                    q = int(c.get('q', 0))
                    confidence = int(c.get('confidence', 95))
        except Exception as e:
            print(f"Gagal membaca arima_config.json: {e}")
    return p, d, q, confidence

def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    value = re.sub(r'^-+|-+$', '', value)
    return value

def normalize_text(value: str) -> str:
    value = value.lower()
    value = re.sub(r'^kab\.?\s*', '', value)
    value = re.sub(r'^kota\s*', '', value)
    value = re.sub(r'[^a-z0-9]+', ' ', value)
    return value.strip()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Agromonitor ARIMA Forecasting ML Service",
        "storage_path": STORAGE_DIR,
        "available_csv_files": [os.path.basename(f) for f in glob.glob(os.path.join(STORAGE_DIR, "harga_pokok_jateng_*.csv"))]
    }

@app.get("/predict")
def predict_commodity(
    slug: str = Query(..., description="Slug komoditas, misal: beras-medium"),
    days: int = Query(14, description="Jumlah hari ramalan ke depan"),
    region: str = Query(None, description="Wilayah kabupaten/kota opsional"),
    p: int = Query(None, description="Auto-Regressive parameter (p)"),
    d: int = Query(None, description="Integrated parameter (d)"),
    q: int = Query(None, description="Moving Average parameter (q)"),
    confidence: int = Query(None, description="Confidence interval percentage")
):
    try:
        csv_files = glob.glob(os.path.join(STORAGE_DIR, "harga_pokok_jateng_*.csv"))
        if not csv_files:
            raise HTTPException(status_code=500, detail="Tidak ada file data CSV ditemukan di folder storage.")

        # Load all CSV files
        df_list = []
        for file in csv_files:
            try:
                temp_df = pd.read_csv(file)
                df_list.append(temp_df)
            except Exception as e:
                print(f"Gagal membaca file {file}: {e}")

        if not df_list:
            raise HTTPException(status_code=500, detail="Gagal membaca data dari file CSV.")

        raw_df = pd.concat(df_list, ignore_index=True)
        raw_df['tanggal_awal'] = pd.to_datetime(raw_df['tanggal_awal'], format='%d/%m/%Y')

        # Filter by slug matching the commodity name
        raw_df['slug'] = raw_df['komoditas'].apply(slugify)
        df_commodity = raw_df[raw_df['slug'] == slug].copy()

        if df_commodity.empty:
            raise HTTPException(status_code=404, detail=f"Komoditas dengan slug '{slug}' tidak ditemukan.")

        # Resolve display name and unit
        commodity_name = str(df_commodity['komoditas'].iloc[0])
        unit = str(df_commodity['unit'].iloc[0]) if 'unit' in df_commodity.columns else 'kg'

        # Optional region filter
        if region:
            norm_region = normalize_text(region)
            df_commodity = df_commodity[
                df_commodity['kabupaten_kota'].apply(lambda x: norm_region in normalize_text(str(x)))
            ]
            if df_commodity.empty:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Data tidak ditemukan untuk komoditas '{commodity_name}' di wilayah '{region}'."
                )

        # Remove 0 prices
        df_commodity = df_commodity[df_commodity['harga_tanggal_awal'] > 0]
        if df_commodity.empty:
            raise HTTPException(status_code=400, detail="Semua data harga untuk kriteria ini bernilai 0.")

        # Aggregate daily average
        df_daily = df_commodity.groupby('tanggal_awal')['harga_tanggal_awal'].mean().reset_index()
        df_daily.columns = ['Date', 'Price']
        df_daily.set_index('Date', inplace=True)
        df_daily.sort_index(inplace=True)

        if len(df_daily) < 5:
            raise HTTPException(
                status_code=400, 
                detail=f"Data historis ({len(df_daily)} hari) terlalu sedikit untuk melakukan peramalan ARIMA. Minimal dibutuhkan 5 hari."
            )

        # Fit ARIMA model
        cfg_p, cfg_d, cfg_q, cfg_conf = get_arima_order(slug)
        order_p = p if p is not None else cfg_p
        order_d = d if d is not None else cfg_d
        order_q = q if q is not None else cfg_q
        conf_level = confidence if confidence is not None else cfg_conf
        alpha = 1.0 - (conf_level / 100.0)

        try:
            model = ARIMA(df_daily['Price'], order=(order_p, order_d, order_q))
            fitted_model = model.fit()
        except Exception as e_arima:
            print(f"Gagal melatih ARIMA({order_p},{order_d},{order_q}), mencoba ARIMA(1,1,0): {e_arima}")
            try:
                model = ARIMA(df_daily['Price'], order=(1, 1, 0))
                fitted_model = model.fit()
                order_p, order_d, order_q = 1, 1, 0
            except Exception as e_fallback:
                raise HTTPException(status_code=500, detail=f"Gagal fitting model ARIMA: {e_fallback}")

        # Compute training metrics (MAPE & RMSE on fitted values)
        fitted_vals = fitted_model.fittedvalues
        valid_idx = ~np.isnan(fitted_vals) & ~np.isnan(df_daily['Price'])
        
        actuals = df_daily['Price'][valid_idx]
        preds = fitted_vals[valid_idx]

        if len(actuals) > 0:
            rmse = float(np.sqrt(mean_squared_error(actuals, preds)))
            mape = float(np.mean(np.abs((actuals - preds) / actuals)) * 100)
        else:
            rmse = 0.0
            mape = 0.0

        # Perform forecasting
        forecast_result = fitted_model.get_forecast(steps=days)
        forecast_mean = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=alpha)

        # Create forecast timeline
        future_dates = pd.date_range(start=df_daily.index[-1] + pd.Timedelta(days=1), periods=days)
        
        forecast_list = []
        for i in range(days):
            date_str = future_dates[i].strftime("%Y-%m-%d")
            val = max(0, int(round(forecast_mean.iloc[i])))
            upper = max(0, int(round(conf_int.iloc[i, 1])))
            lower = max(0, int(round(conf_int.iloc[i, 0])))
            
            forecast_list.append({
                "time": date_str,
                "value": val,
                "upperBound": upper,
                "lowerBound": lower
            })

        # Hitung metrik dinamis untuk Peringatan Harga & Catatan Prediksi
        last_historical_price = float(df_daily['Price'].iloc[-1])
        final_forecasted_price = float(forecast_mean.iloc[-1])
        price_change = final_forecasted_price - last_historical_price
        price_change_percent = float((price_change / last_historical_price) * 100) if last_historical_price > 0 else 0.0

        # Tentukan trend_direction
        if price_change_percent > 1.5:
            trend_direction = "UP"
            trend_desc = "naik"
        elif price_change_percent < -1.5:
            trend_direction = "DOWN"
            trend_desc = "turun"
        else:
            trend_direction = "STABLE"
            trend_desc = "stabil"

        # Volatilitas rata-rata dari lebar pita kepercayaan
        conf_widths = (conf_int.iloc[:, 1] - conf_int.iloc[:, 0]) / forecast_mean
        avg_conf_width = float(np.mean(conf_widths)) if not conf_widths.empty else 0.0

        if avg_conf_width > 0.15:
            volatility = "TINGGI"
        elif avg_conf_width > 0.08:
            volatility = "SEDANG"
        else:
            volatility = "RENDAH"

        # Peringatan harga (alert_trigger)
        if price_change_percent >= 5.0:
            alert_trigger = "CRITICAL"
        elif price_change_percent >= 1.5 or price_change_percent <= -3.0 or volatility == "TINGGI":
            alert_trigger = "WARNING"
        else:
            alert_trigger = "NONE"

        # Buat dynamic_note Bahasa Indonesia yang formal dan informatif
        if trend_direction == "UP":
            dynamic_note = (
                f"Berdasarkan analisis model ARIMA({order_p},{order_d},{order_q}), harga {commodity_name} diprediksi mengalami tren {trend_desc} "
                f"sebesar {price_change_percent:.2f}% dalam {days} hari ke depan (dari Rp {last_historical_price:,.0f} "
                f"menjadi Rp {final_forecasted_price:,.0f}). Volatilitas peramalan dinilai {volatility.lower()} "
                f"dengan interval kepercayaan {conf_level}%. Harap waspada terhadap potensi kenaikan harga di pasar."
            )
        elif trend_direction == "DOWN":
            dynamic_note = (
                f"Berdasarkan analisis model ARIMA({order_p},{order_d},{order_q}), harga {commodity_name} diprediksi mengalami tren {trend_desc} "
                f"sebesar {abs(price_change_percent):.2f}% dalam {days} hari ke depan (dari Rp {last_historical_price:,.0f} "
                f"menjadi Rp {final_forecasted_price:,.0f}). Volatilitas peramalan dinilai {volatility.lower()} "
                f"dengan interval kepercayaan {conf_level}%. Penurunan ini mengindikasikan pasokan komoditas yang melimpah."
            )
        else:
            dynamic_note = (
                f"Berdasarkan analisis model ARIMA({order_p},{order_d},{order_q}), harga {commodity_name} diprediksi relatif {trend_desc} "
                f"dengan proyeksi perubahan {price_change_percent:+.2f}% dalam {days} hari ke depan (dari Rp {last_historical_price:,.0f} "
                f"menjadi Rp {final_forecasted_price:,.0f}). Volatilitas peramalan dinilai {volatility.lower()} "
                f"dengan interval kepercayaan {conf_level}%, menunjukkan kondisi pasar yang kondusif."
            )

        return {
            "success": True,
            "data": {
                "commodityId": slug,
                "commodityName": commodity_name,
                "unit": unit,
                "modelUsed": f"ARIMA ({order_p},{order_d},{order_q}) via Python ML-Service",
                "metrics": {
                    "mape": round(mape, 2),
                    "rmse": round(rmse, 2),
                    "confidenceLevel": f"{conf_level}%"
                },
                "forecast": forecast_list,
                "trendDirection": trend_direction,
                "priceChangePercent": round(price_change_percent, 2),
                "volatility": volatility,
                "alertTrigger": alert_trigger,
                "dynamicNote": dynamic_note
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal server: {str(e)}")
