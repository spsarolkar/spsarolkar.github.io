---
layout: page
title: Indian Sign Language Translation
description: Indian Sign Language recognition with Apple Vision keypoints, MLX training and a Hugging Face Transformer demo, building on the original IISc capstone.
img: assets/projects/ISL/ISL-Thumbnail.png
importance: 3
category: work
tech_stack:
  - Swift / MLX
  - Apple Vision
  - Transformer
  - Python
  - TensorFlow
  - OpenPose
  - LSTM
giscus_comments: true
---

SignLanguageTranslate explores recognition of Indian Sign Language (ISL), from an IISc capstone using OpenPose and an LSTM to an iPad application that extracts Apple Vision keypoints and trains Transformer classifiers on device with MLX Swift.

The current hosted demo compares rolling and causal Transformers on isolated signs from INCLUDE. It pairs public sample videos with the corresponding saved keypoints, so visitors can inspect predictions and run the uploaded checkpoints without installing the iPad app.

<section id="demo" aria-labelledby="current-demo-title">
  <h2 id="current-demo-title">Try SignLanguageTranslate</h2>
  <p>Select a sign and clip in the demo below. The timeline starts with clearly labeled archived predictions; use the per-clip inference button to compute a fresh prediction on Hugging Face.</p>
  {% include sign_language_demo.liquid %}
</section>

<section id="model-and-data" aria-labelledby="model-data-title">
  <h2 id="model-data-title">The model and data behind the demo</h2>
  <p>The Space is configured for the latest uploaded inference artifacts in my <strong>isl-transformer-mlx</strong> repository: the rolling Transformer at epoch 31 and the causal Transformer at epoch 102. Both use the same saved Apple Vision validation inputs. The Space reports final accuracy and wrong early confirmations separately.</p>
  <ol class="sign-model-flow" aria-label="Current Transformer demo pipeline">
    <li><strong>INCLUDE videos</strong>Public sample clips provide the source playback.</li>
    <li><strong>Apple Vision poses</strong>Saved body and hand keypoints provide the model input.</li>
    <li><strong>Two Transformers</strong>The Hugging Face server runs the uploaded rolling and causal checkpoints.</li>
    <li><strong>Inspect predictions</strong>Compare the expected sign, final guess and early confirmations.</li>
  </ol>
  <div class="sign-data-links">
    <a href="https://huggingface.co/datasets/spsarolkar/AI4Bharat-INCLUDE-dataset">Browse public video dataset</a>
    <a href="https://huggingface.co/datasets/ai4bharat/INCLUDE">Original INCLUDE dataset and attribution</a>
    <a href="https://huggingface.co/spaces/spsarolkar/SignLanguageTranslate/tree/main">Demo source and evaluation contract</a>
  </div>
  <p>The <a href="https://huggingface.co/spsarolkar/isl-transformer-mlx">model repository (private)</a> and <a href="https://huggingface.co/datasets/spsarolkar/AI4Bharat-INCLUDE-keypoints">keypoint dataset (private)</a> require owner access. The public demo loads them on the Hugging Face server; visitors can use it without a token or access to the private repositories.</p>
  <p>This demo uses saved poses for isolated-sign recognition. It does not process a visitor’s camera or uploaded video. The validation panel was also used for checkpoint selection, so its scores describe that panel rather than an independent test set; signer independence is unverified. The source-video repository’s splits and the saved iPad validation split are labeled separately inside the demo.</p>
</section>

{% include sign_language_dataset.liquid %}

<details class="sign-legacy-analysis" markdown="1">
<summary>Original IISc capstone and archived dataset charts</summary>

## Original IISc capstone

The original system used OpenPose to extract body and hand keypoints from video frames, then passed the sequence to a TensorFlow LSTM classifier. The diagrams, dataset notes and model definition below document that earlier implementation.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/ISL/openpose_keypoints.png" title="OpenPose Keypoints" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

We preprocessed each frame’s keypoints into a flat vector and stacked them across time to form the network input. The LSTM learned to classify the motion sequence into a sign label.

<div class="caption">
  Historical capstone pipeline: video frames → OpenPose keypoints → LSTM → sign label.
</div>
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/projects/ISL/ISL_Data_Flow_Diagram.jpg" title="Model Architecture: OpenPose → LSTM → Text" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
<div class="caption">
  The original OpenPose and LSTM data flow, retained for the capstone’s implementation history.
</div>

## Historical dataset analysis

These figures are retained from the original capstone notes. The summary and category table report different video totals; they are not the size of the current Transformer validation panel.

| Characteristic       |  Details  |
| :------------------- | :-------: |
| Categories           |    15     |
| Words                |    263    |
| Videos               |   4292    |
| Avg Videos per Class |   16.3    |
| Avg Video Length     |   2.57s   |
| Min Video Length     |   1.28s   |
| Max Video Length     |   6.16s   |
| Frame Rate           |  25 fps   |
| Resolution           | 1920x1080 |

### Size of each category

| Category           | Number of Classes | Number of Videos  |
| :----------------- | :---------------: | :---------------: |
| Adjectives         |        59         |        791        |
| Animals            |         8         |        166        |
| Clothes            |        10         |        198        |
| Colours            |        11         |        222        |
| Days and Time      |        22         |        306        |
| Greetings          |         9         |        185        |
| Means of Transport |         9         |        186        |
| Objects at Home    |        27         |        379        |
| Occupations        |        16         |        225        |
| People             |        26         |        513        |
| Places             |        19         |        399        |
| Pronouns           |         8         |        168        |
| Seasons            |         6         |        85         |
| Society            |        23         |        324        |
|                    |  Categories# 263  | Total Videos-4287 |

### Original LSTM model structure

```python
    translation_model = Sequential()
    translation_model.add(Input(shape=((20, 156))))
    translation_model.add(keras.layers.Masking(mask_value=0.))
    translation_model.add(BatchNormalization())
    translation_model.add(Bidirectional(LSTM(32, recurrent_dropout=0.2, return_sequences=True)))

    translation_model.add(Dropout(0.2))
    translation_model.add(Bidirectional(LSTM(32, recurrent_dropout=0.2)))

    translation_model.add(keras.layers.Activation('elu'))
    translation_model.add(Dense(32, use_bias=False, kernel_initializer='he_normal'))

    translation_model.add(BatchNormalization())
    translation_model.add(Dropout(0.2))
    translation_model.add(keras.layers.Activation('elu'))
    translation_model.add(Dense(32, kernel_initializer='he_normal',use_bias=False))

    translation_model.add(BatchNormalization())
    translation_model.add(keras.layers.Activation('elu'))
    translation_model.add(Dropout(0.2))
    translation_model.add(Dense(len(list(expression_mapping.keys())), activation='softmax'))
    isl_translator=ISLSignPosTranslator(bodypose_25_model(),handpose_model(), translation_model)
```

Total params: 82,679 (322.96 KB)
Trainable params: 82,239 (321.25 KB)
Non-trainable params: 440 (1.72 KB)

### Videos processed per category

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/ISL/isl_videos_processed_per_category.png" title="Videos processed per category" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

### Videos count per label

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/ISL/isl_video_count_per_label.jpg" title="Count of videos per Label" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

### Historical training logs

[Original TensorBoard location](https://huggingface.co/cdsteameight/ISL-SignLanguageTranslation/tensorboard) — retained as a historical reference; it is not the current Transformer demo.

</details>

### What changed since the capstone

- The current application uses Apple Vision keypoints and on-device MLX Swift training.
- The public Space compares uploaded rolling and causal Transformer checkpoints on the same saved validation clips.
- Visitors can inspect available source videos, prediction timelines and validation exports, or run inference on a selected clip.

### Next steps

Continuous signing, broader data coverage and independently qualified evaluation remain areas for further work. The isolated-sign demo does not establish sentence translation or general-purpose real-world recognition.
