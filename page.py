import streamlit as st
import requests
import pandas as pd
import uuid

API_ENDPOINT = "https://um1acxhydh.execute-api.eu-north-1.amazonaws.com/prod"

st.set_page_config(page_title="IoT Assembly Line Monitor", layout="wide")
st.title("🤖 IoT Assembly Line Monitor")
st.caption("Real-time monitoring of robotic arm sensors")


def fetch_data():
    try:
        response = requests.post(API_ENDPOINT, json={"action": "fetch"})
        if response.ok:
            return response.json()
        else:
            st.error(f"Failed to fetch data: {response.status_code}")
    except Exception as e:
        st.error(f"Error fetching data: {e}")
    return []


def submit_data(data):
    try:
        response = requests.post(API_ENDPOINT, json=data)
        if response.ok:
            st.success("✅ Sensor data submitted successfully.")
        else:
            st.error(f"Submission failed: {response.status_code}")
    except Exception as e:
        st.error(f"Error submitting data: {e}")


with st.sidebar:
    st.header("📥 Add Sensor Data")
    with st.form("sensor_form"):
        vibration = st.number_input("Vibration", step=0.01, format="%.2f")
        temperature = st.number_input("Temperature (°C)", step=0.01, format="%.2f")
        torque = st.number_input("Torque", step=0.01, format="%.2f")
        current = st.number_input("Current (A)", step=0.01, format="%.2f")
        noise = st.number_input("Noise (dB)", step=0.01, format="%.2f")
        submitted = st.form_submit_button("Add Data")

        if submitted:
            data = {
                "id": str(uuid.uuid4()),
                "vibration": vibration,
                "temperature": temperature,
                "torque": torque,
                "current": current,
                "noise": noise,
                "label": 0
            }
            submit_data(data)

# Fetch and display data
sensor_data = fetch_data()
if not sensor_data:
    st.info("No data available.")
else:
    df = pd.DataFrame(sensor_data)

    st.subheader("📊 Summary")
    cols = st.columns(5)

    summary_fields = ["vibration", "temperature", "torque", "current", "noise"]
    units = ["", "°C", "", "A", "dB"]
    icons = ["💥", "🌡️", "⚙️", "⚡", "🔊"]

    for idx, (field, unit, icon) in enumerate(zip(summary_fields, units, icons)):
        with cols[idx]:
            avg = df[field].mean()
            max_val = df[field].max()
            if field == "vibration":
                anomalies = df[df["label"] == 1].shape[0]
                st.metric(f"{icon} {field.capitalize()} (Avg)", f"{avg:.2f}", f"{anomalies} anomalies")
            else:
                st.metric(f"{icon} {field.capitalize()} (Avg)", f"{avg:.2f} {unit}", f"Max: {max_val:.2f} {unit}")

    st.subheader("📄 Sensor Data Table")
    df_display = df.copy()
    df_display["label"] = df_display["label"].apply(lambda x: "Anomaly" if x == 1 else "Normal")
    st.dataframe(df_display, use_container_width=True)