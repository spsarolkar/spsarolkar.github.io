---
layout: post
title: "Build Your Own GCP ML Engineer Mock Exam App with GitHub Pages"
date: 2025-07-05
author: "Sunil Sarolkar"
tags: [GCP, Machine Learning, Certification, Mock Exam, Jekyll, GitHub Pages]
---

If you're preparing for the **Google Cloud Certified - Professional Machine Learning Engineer** exam and want a structured, interactive way to practice, I’ve built a free mock exam tool — and you can too! Here's how I created a professional, responsive **mock test web app** hosted on GitHub Pages using Jekyll, YAML, and TailwindCSS.

---

## 💡 Why I Built This

As I prepared for the GCP ML Engineer exam, I noticed a lack of high-quality, interactive mock exams — especially ones that are open source and customizable. So I decided to build one myself with a few goals in mind:

- ✅ Structured questions based on the **official exam guide**
- ✅ Filterable by **tags and sections**
- ✅ Timer-based **exam simulation**
- ✅ Immediate **feedback and score**
- ✅ Review incorrect answers and **download as PDF**
- ✅ Hosted freely using **GitHub Pages**

---

## 🔨 Tech Stack

- **Jekyll** (for static site generation)
- **TailwindCSS** (for styling)
- **JavaScript** (no frameworks)
- **YAML** (for storing questions by section)
- **GitHub Pages** (for free hosting)

---

## 🧠 Features

| Feature                    | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| 🧪 Full & Quick Exam Modes | Simulate a 120-minute full exam or a 30-minute practice sprint       |
| 🏷️ Tag Filtering           | Filter questions by topics like Vertex AI, Feature Engineering, etc. |
| 📋 Section-Based Sampling  | Questions weighted by domain (%), as in the official exam guide      |
| ⏰ Timer & Auto-Submit     | Countdown timer with automatic submission on timeout                 |
| 📊 Summary View            | Full answer breakdown with highlights for correct/incorrect choices  |
| ⬇️ PDF Download            | Print-friendly summary to save results                               |
| 🧩 Review Incorrect Only   | Focus your prep on the questions you missed                          |

---

## 🖼️ A Visual Overview

![GCP ML Mock Exam Thumbnail](assets/projects/GCPML_ENG_MOCK_EXAM/GCP_ml_exam_thumbnail.png)

---

## 🚀 Try the App

👉 **[Launch Mock Exam App](https://spsarolkar.github.io/ml-cert-mock-exam/)**  
No login. No cookies. Just practice.

---

## 📁 How It Works

### Folder Structure

```
ml-cert-mock-exam/
├── index.html            # Landing page
├── mock-test.html        # Main app
├── _data/sections/       # YAML files for question banks
├── README.md
├── CONTRIBUTING.md
└── thumbnail.png
```

```yaml
- question: "When leveraging BigQuery ML, which consideration focuses on defining the problem structure and desired outcome for the model?"
  options:
    - Building the appropriate BigQuery ML model based on the business problem
    - Optimizing hardware accelerators
    - Integrating with external data sources
    - Monitoring model performance in real-time
  answer: 1
  tags:
    - BigQuery ML
    - Business Problem
```

---

## 💻 Want to Build One Yourself?

The entire project is open source.

👉 [View on GitHub](https://github.com/spsarolkar/ml-cert-mock-exam)

You can fork it, extend it with your own questions, or use it for other certifications (like AWS, Azure, or Kubernetes).

---

## 📢 Disclaimer

This project is **not affiliated with or endorsed by Google**.  
All questions are **original**, inspired by the [official exam guide](https://cloud.google.com/certification/machine-learning-engineer) and intended for learning purposes only.

---

## 🙌 Final Thoughts

I hope this tool helps you **gain confidence** for your exam day. If you find it useful, feel free to ⭐️ star the repo or suggest improvements via a pull request.

Good luck on your ML journey — and may your models always converge!
