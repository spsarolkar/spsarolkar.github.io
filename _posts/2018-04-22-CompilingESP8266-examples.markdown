---
layout: post
title:  "Blinking blue LED of Death of ESP8266"
date:   2016-10-11 10:54:44 +0530
categories: Struts 13 backword compatibility
published: false
---



copy the examples project to root of


compile using
./gen_misc.sh

Write to ESP flash

sudo env "PATH=$PATH" esptool.py --port /dev/ttyUSB0 --baud 921600 write_flash 0x00000 ../../ESP8266_NONOS_SDK/bin/eagle.flash.bin 0x10000 ../../ESP8266_NONOS_SDK/bin/eagle.irom0text.bin 0x3FB000 ../../ESP8266_NONOS_SDK/bin/blank.bin 0x3FC000 ../../ESP8266_NONOS_SDK/bin/esp_init_data_default_v08.bin 0x3FE000 ../../ESP8266_NONOS_SDK/bin/blank.bi