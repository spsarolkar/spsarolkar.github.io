---
layout: page
title: Indian Sign Language Translation
description: A neural-network based system for translating Indian Sign Language using OpenPose keypoints and LSTM.
img: /assets/img/isl-background.jpg
importance: 2
category: work
giscus_comments: true
---

Indian Sign Language (ISL) translation bridges the gap between the hearing-impaired community and those who don’t know sign.  
Our system uses OpenPose to extract body‐ and hand-keypoints from video frames, then feeds the time-series of those points into an LSTM network to produce text translations in real time.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/projects/ISL/openpose_keypoints.png" title="OpenPose Keypoints" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

We preprocess each frame’s keypoints into a flat vector and stack them across time to form the network input. The LSTM learns to map these motion patterns to text tokens—for example, translating the sign for “HELLO,” “THANK YOU,” or “WHERE” in real time.

<div class="caption">
  Diagram of the end-to-end pipeline: video frames → keypoint extraction → sequence model → final translation.
</div>
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/projects/ISL/ISL_Data_Flow_Diagram.jpg" title="Model Architecture: OpenPose → LSTM → Text" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
<div class="caption">
  Above: successive video frames with body and hand keypoints overlaid. These are the inputs to our LSTM time-series network.
</div>

## Key Statistics for the dataset is as follows

```markdown
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
```

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

### Model Structure

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

### Tensorboard training stats

(Tensorboard)[https://huggingface.co/cdsteameight/ISL-SignLanguageTranslation/tensorboard]

### Features

- **Real-time inference** on live webcam or uploaded videos
- **Works offline** once the model is loaded in the browser via TensorFlow.js
- **Custom vocabulary**: you can retrain on your own signs by supplying new CSV keypoint trajectories

### Future Expansion

- We need to use Transformer instead of LSTM to avoid exploding and diminishing gradient problems
- This model can be enhanced further using more data, Door Darshan has huge dataset of news published for sign language translation, we are planning to request the same from Govt of India
