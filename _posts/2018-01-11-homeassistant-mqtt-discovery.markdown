---
layout: post
title: MQTT discovery with Home Assistant
date: 2018-01-11 10:54:44 +0530
categories: Home Assistant
---

Home Assistant is a opensource platform that is customisable enough to accomodate many different types IoT devices.
It allows many different features one of which is discovery of new devices using MQTT protocol.

I have documented the steps below to demonstrate how that can be done.

For this example I will register switch component to home assistant which can toggle its state over MQTT.

To register the switch we need inform home assistant with name of the switch and all its MQTT topics,

```bash
mosquitto_pub -V mqttv311 -h 192.168.0.17 -p 1883 -t "homeassistant/switch/bedroom/config" -m '{"name": "bedroom", "command_topic": "homeassistant/switch/bedroom/set", "payload_on": "ON", "payload_off": "OFF", "availability_topic": "homeassistant/switch/bedroom/available", "state_topic": "homeassistant/bedroom/state"}'
```

Once the switch is registered it should be visible on home assistant UI.

![switch-registered]

[switch-registered]: assets/blog/home_assistant/1_switch_registered.png

As seen in the screenshot above the switch is still not in available state.To turn on its availability, we need to publish "online" status to its availability topic. We will do just that using below command,

```bash
mosquitto_pub -V mqttv311 -h 192.168.0.17 -p 1883 -t "homeassistant/switch/bedroom/available" -m "online"
```

![switch-online]

[switch-online]: assets/blog/home_assistant/2_switch_available_online.png

Now we need to understand the what state and command topics are used. When user of Home Assistant changes the state of the device from Home Assistant UI, command topic is used to convey state change to device from Home Assistant. Home Assistant publishes the relevant message on command topic. Any device intended to receive the command messages have to subscribe to the command topic so that any UI commands are received by the device.
The actual IoT device will subscribe to command_topic and once it makes the changes it will publish the message on state topic of the final status.
Once the device receives the command over command topic. It needs to process the message and make the state change(in our case actual switch is turned on/off depending on message received on command topic), once device succesfully changes the state of actual device, it has to inform Home Assistant about new state transition. This is where state topic comes into picture.

To see how it works we will subscribe to command topic

```bash
mosquitto_sub -v -V mqttv311 -h 192.168.0.17  -t "homeassistant/switch/bedroom/set"
```

Now we will change the state of the switch from UI, as we make the switch ON we see that we receive the message on command topic indicating the switch command

```bash
# mosquitto_sub -v -V mqttv311 -h 192.168.0.17  -t "homeassistant/switch/bedroom/set"
homeassistant/switch/bedroom/set ON
homeassistant/switch/bedroom/set ON
```

As you may notice the even if you turn on the device from UI, Home Assistant resets the state back to its original position. That's because Home Assistant just published the command to the device saying that switch has been turned on from UI. Its responsibility of actual device to execute this instruction on UI and make the actual device state (ON or OFF in case of switch). Once device changes the state iy has to inform Home Assistant by publishing message on state topic as below.

```bash
mosquitto_pub -V mqttv311 -h 192.168.0.17 -p 1883 -t "homeassistant/bedroom/state" -m "ON"
```

![switch-turn-on]

[switch-turn-on]: assets/blog/home_assistant/3_switch_turned_on.png

Once you execute this command you may notice that Home Assistant state on UI is now permanent.

Below is the sequence of events that happen,

![home_assistant_discovery_sequence_diagram]

[home_assistant_discovery_sequence_diagram]: assets/blog/home_assistant/home_assistant_discovery_Sequence_diagram.svg
