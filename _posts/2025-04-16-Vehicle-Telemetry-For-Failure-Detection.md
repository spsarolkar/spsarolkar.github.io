---
layout: post
title: "Vehicle Telemetry using Raspberry Pi with Kafka-based Anomaly Detection"
date: 2025-04-16 20:10:00 +0530
categories: vehicle telemetry anomaly detection raspberrypi kafka
disqus_comments: true
---

In 2019, I built a hobby project to collect real-time vehicle parameters from the **OBD-II port** using an **ELM327 Bluetooth adapter** and a **Raspberry Pi**. This setup allowed me to display **vehicle speed** and **RPM** on a custom instrument console. As a demonstration, the Raspberry Pi connected to the ELM327 via Bluetooth and parsed live vehicle data directly from the CAN bus.

![Architecture Diagram][Architecture Diagram]

[Architecture Diagram]: (/assets/projects/VehicleTelemetry/OBD2_Vehicle_detection.png)

The hardware flow looked like this:

- **Vehicle** → ELM327 / CAN Bus
- **ELM327** → Bluetooth → **Raspberry Pi**
- **Raspberry Pi** → Instrument Console (Python-based UI)

I have now planned to enhance the project with real-time streaming and anomaly detection:

- The Raspberry Pi connects to a **Kafka broker** using a **4G modem**.
- Vehicle telemetry data such as speed, RPM, coolant temperature, and throttle position is pushed to Kafka topics.
- These streams are processed using **Apache Spark**, and anomalies are detected with a trained **ML model**.

## ✅ Implemented Components:

- ELM327 Bluetooth integration
- Real-time data collection on Raspberry Pi
- Custom instrument display for speed and RPM

## 🔜 Planned Enhancements:

- Kafka streaming pipeline with 4G modem
- Apache Spark for telemetry processing
- ML-based failure detection using vehicle health indicators

## Demo & Source Code

You can check out the working video demo and the source code in the GitHub repository:

📽️ **[Demo Video](#)** (replace this with your actual video link)  
💻 **[GitHub Repo](https://github.com/spsarolkar/Tesla/tree/master)**

## Tech Stack

- Raspberry Pi 3B+
- Python 3
- ELM327 OBD-II Adapter
- Apache Kafka (planned)
- Apache Spark MLlib (planned)
- 4G USB Modem

## Final Thoughts

This project connects the physical and digital world by capturing automotive telemetry and enabling intelligent, ML-based diagnostics. It's an exciting intersection of **IoT**, **machine learning**, and **real-time streaming**—a great example of applying data science beyond traditional dashboards.

If you’re working on similar projects or have suggestions for failure prediction features, feel free to connect or fork the repo!
