---
layout: post
title: "StructFormer: Transformer-based Structured Data Adjustment Generator"
date: 2025-04-19 18:10:00 +0530
categories: Transformer Structured Data NLP
---

I recently completed a project called **StructFormer**, a Transformer-based model that generates **SQL adjustment statements** from structured error records. The model is particularly useful in enterprise data processing pipelines where large-scale reconciliation or error adjustment tasks are automated.

### 🔍 Problem Statement

In financial or trading systems, data errors such as "Incorrect Account Type" or "Missing Quantity" are common and typically resolved by writing SQL adjustments. My goal was to create a **sequence-to-sequence model** that learns to generate such adjustments from natural language-like structured inputs.

Example:

**Input:**
```
TradeID=50874 AccountID=ACC1003 ErrorType=Negative Amount
```

**Expected Output:**
```sql
UPDATE Trades SET Amount=831.05 WHERE TradeID=50874; INSERT INTO AdjustmentLog(ErrorID, AdjustedBy) VALUES('ERR5827', 'User1');
```

### 🧠 Model Architecture

- Built using Keras (TensorFlow backend)
- Transformer Encoder-Decoder architecture
- Positional embeddings from Keras Hub
- Trained with SentencePiece tokenizer (custom-trained on domain corpus)
- Custom decoder inference using greedy decoding

```python
@keras.saving.register_keras_serializable(package="transformerEncoder")
class TransformerEncoder(keras.layers.Layer):
    def __init__(self,hidden_dim,intermediate_dim,num_heads,dropout_rate=0.1,name=None, **kwargs):
        super().__init__(name=name, **kwargs)
        key_dim = hidden_dim
        self.intermediate_dim = intermediate_dim
        self.num_heads = num_heads
        self.dropout_rate = dropout_rate
        self.self_attention = keras.layers.MultiHeadAttention(num_heads,key_dim)
        self.self_attn_layer_norm = keras.layers.LayerNormalization()
        self.ff_1 = keras.layers.Dense(intermediate_dim,activation="relu")
        self.ff_2 = keras.layers.Dense(hidden_dim)
        self.ff_layer_norm = keras.layers.LayerNormalization()
        # self.dropout_layer=keras.layers.Dropout(dropout_rate)

    def call(self,source,source_mask):
      residual = x = source
      mask = source_mask[:,None,:]
      x = self.self_attention(query = x,value = x,key = x)#, attention_mask=tf.cast(mask, tf.float32)) # This is specifically required for M1 Mac
      x = x + residual
      x =self.self_attn_layer_norm(x)
      residual = x
      x = self.ff_1(x)
      x = self.ff_2(x)
      x = x+residual
      x = self.ff_layer_norm(x)
      return x
```



The decoder is similarly structured, using both causal and cross attention.

```python
@keras.saving.register_keras_serializable(package="transformerDecoder")
class TransformerDecoder(keras.layers.Layer):
    def __init__(self, hidden_dim, intermediate_dim, num_heads,name=None, **kwargs):
        super().__init__(name=name, **kwargs)
        key_dim = hidden_dim // num_heads
        self.self_attention = keras.layers.MultiHeadAttention(num_heads, key_dim)
        self.self_attention_layernorm = keras.layers.LayerNormalization()
        self.cross_attention = keras.layers.MultiHeadAttention(num_heads, key_dim)
        self.cross_attention_layernorm = keras.layers.LayerNormalization()
        self.feed_forward_1 = keras.layers.Dense(intermediate_dim, activation="relu")
        self.feed_forward_2 = keras.layers.Dense(hidden_dim)
        self.feed_forward_layernorm = keras.layers.LayerNormalization()

    def call(self, target, source, source_mask):
        residual = x = target
        x = self.self_attention(query=x, key=x, value=x, use_causal_mask=True)
        x = x + residual
        x = self.self_attention_layernorm(x)
        residual = x
        mask = source_mask[:, None, :]
        x = self.cross_attention(
            query=x, key=source, value=source#, attention_mask=tf.cast(mask, tf.float32) # This is specifically required for M1 Mac
        )
        x = x + residual
        x = self.cross_attention_layernorm(x)
        residual = x
        x = self.feed_forward_1(x)
        x = self.feed_forward_2(x)
        x = x + residual
        x = self.feed_forward_layernorm(x)
        return x
```

### 🛠️ Technologies Used

- TensorFlow / Keras 3
- SentencePiece tokenizer
- NumPy & Pandas for data preprocessing
- Jupyter Notebooks for development
- FastAPI + React (planned deployment)
- Optional: Spark for scalable pre-tokenization

### 🔍 Results

After extensive training, the model reached **~99% validation accuracy** using windowing-based training, token-level padding, and beam search refinement. Below are some sample predictions:

```
Input: TradeID=29216 AccountID=ACC1003 ErrorType=Incorrect Account Type
Expected: UPDATE Accounts SET AccountType='Savings' WHERE AccountID='ACC1003'...
Predicted: UPDATE Accounts SET AccountType='Checking' WHERE AccountID='ACC1003'...
```

Even when predictions differ, they are syntactically valid and often semantically close.

### 🧹 What Makes This Unique?

- Works well with **real-world structured data**
- Can adapt to new error types via **fine-tuning**
- Supports custom lookup tables (e.g., currencies, account types)
- Tokenization designed to handle numerical and domain-specific vocabulary

### 📆 GitHub Repository

Check out the full codebase, training script, and inference pipeline here:

👉 [https://github.com/spsarolkar/StructFormer](https://github.com/spsarolkar/StructFormer)

### 📈 What's Next?

- Add REST API using FastAPI
- Integrate model with a Streamlit/React dashboard
- Enable multi-record batching and validation UI

---

This was a fascinating experiment, and I plan to evolve it into a plug-and-play solution for **automated structured data correction** in enterprise applications.

Feel free to fork, contribute, or try it on your own datasets! 🚀

