---
layout: post
title:  "Blinking blue LED of Death of ESP8266"
date:   2016-10-11 10:54:44 +0530
categories: Struts 13 backword compatibility
---

Issue:- In the even the flash memory of ESP8266 module gets corrupted it can show symptoms of recursive restart as the the ESP module not able to locate the bootloader.


We need to follow the instructions 
https://www.espressif.com/sites/default/files/documentation/2a-esp8266-sdk_getting_started_guide_en.pdf
5.2. Compilation
5.2.1. Compile ESP8266_NONOS_SDK_v0.9.5 and Later Versions

fLASH THE FILES using ESP tools with the flash map given in the getting started guide


http://www.kloppenborg.net/images/blog/esp8266/esp8266-esp12e-specs.pdf

http://smallbits.marshall-tribe.net/blog/2016/05/14/esp8266-uart-fun