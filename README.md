# Automate Router WiFi bridge setup with Raspberry Pi, NodeJS, Puppeteer and Ansible

I own an old unbranded ADSL/LTE WiFi router which does the job but has a very annoying bug: every single time there's a power outage and the router reboots, or for whatever other reason I don't know about, the Wifi bridge (i.e. connection to another source WiFi network) is broken but the router doesn't automatically reconnect to the source WiFi.

In order to fix this I have to manually log into the (crappy) router admin interface from my laptop's browser, find the right admin web page from the unintuitive navigation bar, perform a few selects and clicks, retype the source WiFi password and, finally, click to apply and persist the configuration.

You can find a more detailed description in the [blog post][post].

## Solution

[These 80 lines](fix-router.js) of NodeJS automate the above process thanks to the awesome [`puppeteer-core`][puppeteer] library. It runs both on MacOS and Linux:

- macOS: tested on my MacBook Air running NodeJS *v13.13.0* and `puppeteer-core` *v3.0.0*
- Linux: tested on my Raspberry Pi `armv6l` architecture, NodeJS *v11.15.0* and `puppeteer-core` *v3.0.0*

Here the [Ansible tasks](ansible-tasks.yml) I use to deploy the solution on my Raspberry Pi

[puppeteer]: <https://pptr.dev/#?show=api-puppeteer-vs-puppeteer-core>
[post]: <https://FIXME>
