---
layout: page
title: StructFormer
description: Transformer-based model built to automate structured data transformation from one schema to another
img: assets/projects/StructFormer/Structformer_Thumbnail.png
importance: 1
category: work
related_publications: true
---

StructFormer is a Transformer-based deep learning model designed to learn adjustments on structured data and generate corrective SQL statements. It is especially useful in enterprise workflows such as financial reconciliation, trade corrections, or regulatory compliance — where minor data inconsistencies require systematic adjustments.

This model can be trained on a dataset of structured validation errors and their corresponding SQL fixes, and then generate valid SQL adjustments for new errors using beam search or greedy decoding.

---

## 🔍 Problem it Solves

Structured datasets in enterprises often have issues such as missing values, mismatched fields, or incorrect classifications. Manual correction is time-consuming and prone to errors. StructFormer automates this by learning patterns in these adjustments and applying them to unseen errors, significantly reducing manual intervention.

---

## 🧠 Key Features

- Transformer encoder-decoder model trained on structured error logs
- SentencePiece tokenizer to handle out-of-vocabulary tokens (like dynamic trade IDs)
- Generates SQL `UPDATE` / `INSERT` statements based on error descriptions
- Supports windowed token training for longer sequences
- Can be trained incrementally and deployed via FastAPI or Hugging Face Spaces

---

## 🏗️ System Architecture

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/projects/StructFormer/Structformer-Architecture.png" title="Architecture Diagram" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    The StructFormer pipeline involves tokenizing structured errors, encoding them, decoding corrective sequences, and detokenizing them into executable SQL statements.
</div>

---

## 💡 Technologies Used

- Python 3, TensorFlow/Keras
- SentencePiece tokenizer
- FastAPI for RESTful inference
- Jupyter + Matplotlib for evaluation
- GitHub Actions + Colab for experimentation

---

## 🧪 Training Results

Achieved 99% validation accuracy on a custom error-adjustment dataset with a vocabulary size of 3000 and positional sequence length of 100. Below are a few prediction samples:

```text
🧾 Input: TradeID=29216 AccountID=ACC1003 ErrorType=Incorrect Account Type
🎯 Expected: UPDATE Accounts SET AccountType='Savings' WHERE AccountID='ACC1003'; ...
🧪 Predicted: UPDATE Accounts SET AccountType='Checking' WHERE AccountID='ACC1003'; ...
```
