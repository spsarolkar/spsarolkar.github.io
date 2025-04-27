---
layout: post
title: Blinking blue LED of death of ESP8266
date: 2018-03-18 10:54:44 +0530
categories: ESP8266
---

I have been working with ESP8266 for adding WIFI capability for home devices, when one day I was trying to test my setup with one older chip on ESP 12E, I stuck across the problem. After the sketch uploaded succesfully ESP started with death loop where the blue led on it started blinking contineously.
I almost though I have bricked it somehow.

After some investigation I found that the ESP chip is somehow not able to start executing the code. The most possible cause it its trying to start execution from some predefined address but fails to find the executable code from that location.
Later I understood that this was the issue with flash memory of ESP8266 module which got corrupted. When it happens it can show symptoms of recursive restart as the the ESP module not able to locate the bootloader.

I followed the instructions mentioned in the documentation at below location, (5.2. Compilation & 5.2.1. Compile ESP8266_NONOS_SDK_v0.9.5 and Later Versions)

https://www.espressif.com/sites/default/files/documentation/2a-esp8266-sdk_getting_started_guide_en.pdf

#### Memory Address Map of ESP 8266

![memorymap]

[memorymap]: assets/blog/ESP8266MemoryMap/memory_map_nonOTA.png "Memory map ESP8266 non OTA"

We need to flash the chip according to the memory supported by specific chip. For ESP 12E I used the below command to flash the generated code.

```
sudo env "PATH=$PATH" esptool.py --port /dev/ttyUSB0 --baud 921600 write_flash 0x00000 ../../ESP8266_NONOS_SDK/bin/eagle.flash.bin 0x10000 ../../ESP8266_NONOS_SDK/bin/eagle.irom0text.bin 0x3FB000 ../../ESP8266_NONOS_SDK/bin/blank.bin 0x3FC000 ../../ESP8266_NONOS_SDK/bin/esp_init_data_default_v08.bin 0x3FE000 ../../ESP8266_NONOS_SDK/bin/blank.bin
```

For any customisation please refer to [documentation of ESP8266](http://www.kloppenborg.net/images/blog/esp8266/esp8266-esp12e-specs.pdf)

Once you flash the code ESP8266 should start normally.

References:

[http://www.kloppenborg.net/images/blog/esp8266/esp8266-esp12e-specs.pdf](http://www.kloppenborg.net/images/blog/esp8266/esp8266-esp12e-specs.pdf)

[http://smallbits.marshall-tribe.net/blog/2016/05/14/esp8266-uart-fun](http://smallbits.marshall-tribe.net/blog/2016/05/14/esp8266-uart-fun)
