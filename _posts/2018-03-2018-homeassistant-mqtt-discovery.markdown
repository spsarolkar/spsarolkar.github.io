---
layout: post
title:  "Blinking blue LED of Death of ESP8266"
date:   2016-10-11 10:54:44 +0530
categories: Struts 13 backword compatibility
---



Command to register the switch
mosquitto_pub -V mqttv311 -h 192.168.0.17 -p 1883 -t "homeassistant/switch/bedroom/config" -m '{"name": "bedroom", "command_topic": "homeassistant/switch/bedroom/set", "payload_on": "ON", "payload_off": "OFF", "availability_topic": "homeassistant/switch/bedroom/available", "state_topic": "homeassistant/bedroom/state"}'

Turn on its availability

mosquitto_pub -V mqttv311 -h 192.168.0.11 -p 1883 -t "homeassistant/switch/bedroom/available" -m "online"

State gives final confirmation of the transition

mosquitto_pub -V mqttv311 -h 192.168.0.11 -p 1883 -t "homeassistant/bedroom/state" -m "ON"

Subscribe to command topic 
mosquitto_sub -v -V mqttv311 -h 192.168.0.17  -t "homeassistant/switch/bedroom/set"

The actual mqtt device will sunscribe to command_topic and once it makes the changes it will publish the message on state topic of the final status