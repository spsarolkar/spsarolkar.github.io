---
layout: post
title: "Polybar does not support the bridge interface for network tracking"
date: 2018-11-25 18:02:15 +0530
categories: Polybar bridge
---

[Polybar](https://github.com/jaagr/polybar) is one of the most popular status bar for tiled window manager. Like most of the statusbars it has network module to track upload and download traffic for interface configured in the configuration file.

In my case I had bridge interface configured so that I could add qemu tap interface to bridge interface so that guest virtual machine will be able to reach internet. I have i3 window manager installed on my gentoo linux with stock i3bar, I wanted to change my taskbar to Polybar which has better look and easy configration.

When I configured the bridge interface Polybar

```bash
[module/eth]
type = internal/network
interface = br0
interval = 3.0

format-connected-underline = #55aa55
format-connected-prefix = ""
format-connected-prefix-foreground = ${colors.foreground-alt}
label-connected = %local_ip%
```

In the configuration above I just wanted to display the public ip address of the bridge interface.

When I started the polybar it started showing error message indicating its not able to connect to my bridge interface `br0`

```bash
warn: module/eth: Failed to query interface 'br0'
```

After few google searches I found the existing issue reported by someone with respect to bridge interface. So I took up the challenge to dig up the code to figure out the problem.

Polybar has network modules which makes use of `ioctl` to determine the link speed of the physical interface which of course fails for bridge network being the virtual rather than physical.

```c
ioctl(*m_socketfd, SIOCETHTOOL, &request) == -1
```

So even though it could compute the network ip address and upload download speed, it fails on the call to `ioctl`. On close observation of the code I could see there is already a special case for `tun`/`tap` interface which is also a virtual device but code was not designed to handle bridge interface.

So I updated the code to handle this special case for bridge interface along with `tun` `tap`.

Below function ealier only handled the `tun` `tap` interfaces, I have added additional if block to mark the new variable `m_bridge` to indicate the bridge interface.

```c
void network::check_tuntap_or_bridge() {
    struct ethtool_drvinfo driver {};
    struct ifreq request {};

    driver.cmd = ETHTOOL_GDRVINFO;

    memset(&request, 0, sizeof(request));

    /*
     * Only copy array size minus one bytes over to ensure there is a
     * terminating NUL byte (which is guaranteed by memset)
     */
    strncpy(request.ifr_name, m_interface.c_str(), IFNAMSIZ - 1);

    request.ifr_data = reinterpret_cast<char*>(&driver);

    if (ioctl(*m_socketfd, SIOCETHTOOL, &request) == -1) {
      return;
    }

    // Check if it's a TUN/TAP device
    if (strncmp(driver.bus_info, "tun", 3) == 0) {
      m_tuntap = true;
    } else if (strncmp(driver.bus_info, "tap", 3) == 0) {
      m_tuntap = true;
    } else {
      m_tuntap = false;
    }

    if (strncmp(driver.driver, "bridge", 3) == 0) {
      m_bridge = true;
    }

  }
```

Once we have interface with `m_bridge` flag set we can make use of this flag to skip the link speed calculation

```c
f(!m_bridge) { // If bridge network then link speed cannot be computed TODO: Identify the physical network in bridge and compute the link speed
	  struct ifreq request {};
	  struct ethtool_cmd data {};

	  memset(&request, 0, sizeof(request));
	  strncpy(request.ifr_name, m_interface.c_str(), IFNAMSIZ - 1);
	  data.cmd = ETHTOOL_GSET;
	  request.ifr_data = reinterpret_cast<char*>(&data);

	  if (ioctl(*m_socketfd, SIOCETHTOOL, &request) == -1) {
	    return false;
	  }

	  m_linkspeed = data.speed;
}
```

Once above code in place it stated the polybar without any error.

I have created the [pull request](https://github.com/jaagr/polybar/pull/1528) for the change, once approve it will be available in the main build.
