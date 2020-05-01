'use strict';
console.log("Starting router-fix process");

const puppeteer = require('puppeteer-core');
const PASSWORDS = require('./passwords.json');
const TIMEOUT_IN_MILLISECONDS = 90 * 1000;
const chromeBinary = process.platform === "darwin" ?
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" :
    "/usr/bin/chromium-browser";

// helper function to fail if password is not found in password.json source file
function get_password(name) {
    if (PASSWORDS[name]) return PASSWORDS[name];
    console.error("Missing password key in passwords.json: " + name);
    process.exit(1);
}

// ensure process is terminated before TIMEOUT_IN_MILLISECONDS
function terminate() {
    console.error(`Time out of ${TIMEOUT_IN_MILLISECONDS / 1000} seconds reached, exiting`);
    process.exit(1);
}
const timeout = setTimeout(terminate, TIMEOUT_IN_MILLISECONDS);

// HTTP data
const routerBaseUrl = process.env.ROUTER_URL || "http://192.168.0.1";
const mainUrl = new URL('ap_client_dynamic.asp', routerBaseUrl);
const routerAuth = { username: "admin", password: get_password("ROUTER") };
const wifiPassword = get_password("WIFI");

// HTML selectors
const connectSelector = '[value="Connect"]';
const applySelector = '[name="ApCliWPAPSK"]';
const submitSelector = '#submitButton';
const checkSelector = '[name="check0"]';
const scanWirelessSelector = "#scan_wireless";

// Puppeteer logic
(async () => {
    const browser = await puppeteer.launch({
        executablePath: chromeBinary,
        headless: true,
        product: "chrome",
        timeout: 0,
    });
    console.log("Browser ready");

    // open main wifi-bridge setup page
    const main = await browser.newPage();
    main.authenticate(routerAuth);
    await main.goto(mainUrl);
    console.log("Main page opened");

    // open select-wifi popup page
    const popupPromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    await main.click(scanWirelessSelector);
    console.log(`${scanWirelessSelector} botton clicked`);

    // select the wireless from select-wifi popup page
    const popup = await popupPromise;
    await Promise.all([popup.waitForSelector(connectSelector), popup.waitForSelector(checkSelector)]);
    console.log("select-wifi page loaded");
    await popup.click(connectSelector); // assuming first listed wifi SID is the good one
    console.log(`${connectSelector} botton clicked`);

    // set the wireless password
    await main.waitForSelector(applySelector);
    await main.keyboard.type(wifiPassword);
    console.log("wifi password typed");

    // apply config
    main.on('dialog', async dialog => await dialog.accept());
    await main.click(submitSelector);
    console.log(`${submitSelector} botton clicked`);

    // terminate gracefully
    await browser.close();
    clearTimeout(timeout);
    console.log("All done, exiting");
})();
