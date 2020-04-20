'use strict';
const puppeteer = require('puppeteer');
const PASSWORDS = require('./passwords.json');

function get_password(name) {
    if (PASSWORDS[name]) return PASSWORDS[name];
    console.error("Missing password key in passwords.json: " + name);
    process.exit(1);
}

const routerBaseUrl = process.env.ROUTER_URL || "http://192.168.0.1";
const mainUrl = new URL('ap_client_dynamic.asp', routerBaseUrl);
const routerAuth = { username: "admin", password: get_password("ROUTER") };
const wifiPassword = get_password("WIFI");

(async () => {
    const browser = await puppeteer.launch();

    const main = await browser.newPage();
    main.authenticate(routerAuth);
    main.once('load', () => console.log('Main page loaded'));
    await main.goto(mainUrl);

    // select the wireless
    const connectSelector = '[value="Connect"]';
    const applySelector = '[name="ApCliWPAPSK"]';
    const submitSelector = '#submitButton';
    const checkSelector = '[name="check0"]';
    const scanWirelessSelector = "#scan_wireless";

    await main.click(scanWirelessSelector);
    const popupPromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    const popup = await popupPromise;
    await popup.waitForSelector(connectSelector);
    await popup.waitForSelector(checkSelector);
    await popup.waitFor(4000);
    console.log('"Connect" page loaded');
    await popup.click(connectSelector); // assuming first listed wifi SID is the good one

    // set the wireless password
    await main.waitForSelector(applySelector);
    await main.keyboard.type(wifiPassword);

    // apply config
    main.on('dialog', async dialog => await dialog.accept());
    await main.click(submitSelector);

    await browser.close();
})();
