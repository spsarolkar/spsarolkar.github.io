---
layout: page
title: Vehicle Telemetry with Raspberry Pi & Kafka
description: Capturing vehicle parameters using Raspberry Pi & ELM327 with real-time anomaly detection planned using Kafka and Spark
img: assets/projects/vehicletelemetry/Vehicle_Telemetry_Thumbnail.png
importance: 3
category: fun
giscus_comments: true
---

A Raspberry Pi-powered telemetry console that connects to your car’s OBD-II port using **ELM327** (or CAN Bus), captures parameters like **RPM**, **speed**, **coolant temperature**, and displays them in real-time on a Python-based UI.

In the future, we plan to stream data over **Kafka** using a 4G modem and analyze anomalies using **Spark ML**.

---

## 🚗 System Architecture

<div class="row justify-content-sm-center">
  <div class="col-sm-10 mt-3 mt-md-0">
    {% include figure.liquid path="assets/projects/vehicletelemetry/Vehicle_Telemetry_Architecture.png" title="System Architecture" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

<div class="caption">
    The current and planned system architecture from ELM327 → Raspberry Pi → Kafka → Spark ML model.
</div>

---

## 🔧 Completed Features

- Vehicle data captured via ELM327 (Bluetooth) or CAN bus.
- Real-time dashboard on Raspberry Pi showing RPM & speed.
- Python UI-based instrument console.

---

## 🔬 Planned Enhancements

- Integrate Kafka to stream telemetry via 4G modem.
- Use Apache Spark for real-time anomaly detection.
- ML model to predict early signs of failure.

---

## 📷 Screenshots & Demo

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/vehicletelemetry/demo1.png" title="OBD-II Dashboard" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/vehicletelemetry/demo2.png" title="Live RPM & Speed" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/vehicletelemetry/demo3.png" title="Python UI Console" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

<div class="caption">
    From left to right: OBD-II dashboard, real-time speed/RPM values, Raspberry Pi console display.
</div>

---

## 📽️ Demo Video

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="https://youtu.be/X3aA26rKwIs?si=mEJq76wGndq43bpp" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

---

## 💻 Source Code

🔗 [GitHub Repository](https://github.com/spsarolkar/Tesla/tree/master)

---

## 🔍 Technologies Used

- Raspberry Pi (Python)
- ELM327 / CAN Bus
- Bluetooth communication
- Apache Kafka (Planned)
- Apache Spark ML (Planned)

---

If you're interested in IoT meets machine learning, or automotive diagnostics — feel free to explore the repo, suggest enhancements, or fork it!
