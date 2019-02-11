const got = require("got");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
    const URL = req.query.url;
    const blacklist = req.query.blacklist || [];

    if (!URL) return res.status(400).send("Missing URL parameter.");

    const linkChecker = new Spider(URL, blacklist, true);
    
    // Wrap it all in a try catch because fuck it.
    try {
        linkChecker.start();
        // 1 minute timeout.
        setTimeout(() => linkChecker.stop(), 1000 * 60);

        await linkChecker.waitForIdle();

        let formattedReport = formatReport(linkChecker.report);
        res.set("Content-Type", "text/plain");
        res.send(formattedReport);
    } catch (err) {
        linkChecker.stop();
        res.status(500).send("Error while crawling: " + err);
    }
};

class Spider {
    /**
     * Creates a Spider.
     * @param {string} domain The root domain of the website.
     * @param {string[]} blacklist An array of URLs that should NEVER appear in the scan.
     * @param {boolean} verbose Whether or not to log steps to the console.
     */
    constructor(domain, blacklist = [], verbose = false) {
        if (!domain.startsWith("http")) domain = "http://" + domain;

        this.domain = new URL(domain).hostname;
        this.blacklist = blacklist;
        this.verbose = verbose;
        this.nextQueue = [];
        this.crawlPath = [];
        this.urls = [];
        this.working = false;
        this.report = {
            ok: [],
            warn: [],
            error: [],
            omit: []
        }
    }

    /**
     * If verbose mode is enabled, logs to console.
     * @param {any} content The content to log.
     */
    log(content) {
        if (!this.verbose) return;

        console.log(content);
    }

    async waitForIdle() {
        return new Promise(resolve => {
            let intervalID = setInterval(() => {
                if (!this.working || this.nextQueue.length == 0) {
                    this.log("Spider is idle!");
                    clearInterval(intervalID);
                    resolve();
                }
            }, 1000);
        });
    }

    /**
     * Starts the Spider.
     */
    start() {
        this.log("Starting...");

        this.working = true;

        this.log("Crawling root page...");
        this.crawl("http://" + this.domain, this.domain);
    }

    /**
     * Stops the spider.
     */
    stop() {
        this.log("Stopped.");
        this.working = false;
    }

    /**
     * Loop function for crawling the website.
     * @param {string} url The URL to crawl.
     */
    async crawl(url, referrer) {
        if (!this.working) return;

        let result = await this.crawlToSave(url, referrer);

        if (result.result === "OK") {
            result.next.forEach(nextUrl => {
                this.crawl(nextUrl, url);
            });
        }
    }

    /**
     * Checks if a URL is part of the root domain.
     * @param {string} url The URL to test.
     */
    urlMatchesDomain(url) {
        let isValidUrl = true;
        try {
            if (new URL(url).hostname != this.domain) isValidUrl = false;
        } catch (err) {
            // means the URL isn't valid and will be handled later
        }

        return isValidUrl;
    }

    /**
     * Crawls to a URL and saves the output to the Spider's crawlPath.
     * @param {string} url The URL to crawl to.
     * @returns {Promise<{url: string, result: "OK"|"WARN"|"ERROR", referrer: string, status: number, next?: Array<string>}>}
     */
    async crawlToSave(url, referrer) {
        let result = await this.crawlTo(url, referrer);

        this.report[result.result.toLowerCase()].push(result);

        this.crawlPath.push(result);
        return result;
    }

    /**
     * Crawls to a url.
     * @param {string} url The URL to crawl to.
     * @returns {Promise<{url: string, result: "OK"|"WARN"|"ERROR", referrer: string, status: number, next?: Array<string>}>}
     */
    async crawlTo(url, referrer) {
        this.urls.push(url);

        this.log(`Working on ${url} (from ${referrer})`);

        return new Promise((resolve, reject) => {
            if (!referrer.includes(this.domain)) {
                return resolve({
                    url: url,
                    result: "OMIT",
                    referrer,
                    status: 0
                })
            }

            let isBlacklisted = false;
            this.blacklist.forEach(str => {
                if (url.includes(str)) isBlacklisted = true;
            });
            if (isBlacklisted) {
                return resolve({
                    url: url,
                    result: "ERROR",
                    referrer,
                    status: 0
                });
            }

            got(url).then(resp => {
                if (resp.statusCode < 200 || resp.statusCode > 299) {
                    this.log(`${url} responded with ${resp.statusCode} (from ${referrer}).`);

                    resolve({
                        url: url,
                        result: "WARN",
                        referrer,
                        status: resp.statusCode
                    });
                } else {
                    if (!resp.headers["content-type"].includes("html")) {
                        this.log(`${url} responded with 2XX but isn't readable (from ${referrer}).`);

                        resolve({
                            url: url,
                            result: "OK",
                            referrer,
                            status: resp.statusCode,
                            next: []
                        });
                    } else {
                        this.log(`${url} responded with 2XX. Scanning for URLs... (from ${referrer})`);

                        let urls = [];

                        let $ = cheerio.load(resp.body);
                        $("*[href*='.'], *[src*='.']").each((i, elem) => {
                            let url = $(elem).attr("href") || $(elem).attr("src");
                            if (!urls.includes(url)) {
                                urls.push(url);
                            }
                        });

                        let next = urls.filter(nextUrl => {
                            let temp;
                            if (nextUrl.startsWith("//")) {
                                temp = "http:" + nextUrl;
                            } else if (nextUrl.startsWith("/")) {
                                temp = url + nextUrl;
                            } else {
                                temp = nextUrl;
                            }
                            return (!this.urls.includes(temp))
                        }).map(nextUrl => {
                            if (nextUrl.startsWith("//")) {
                                return "http:" + nextUrl;
                            } else if (nextUrl.startsWith("/")) {
                                return url + nextUrl;
                            } else {
                                return nextUrl;
                            }
                        });

                        this.log(`Found URLs:\n${next}`);

                        this.nextQueue.splice(this.nextQueue.indexOf(url), 1);
                        this.nextQueue.push(...next);

                        resolve({
                            url: url,
                            result: "OK",
                            referrer,
                            status: resp.statusCode,
                            next: next
                        });
                    }
                }
            }).catch(err => {
                this.log(`Error when attempting to work on ${url} (from ${referrer}).`);
                this.log(err);

                if (url.toLowerCase().startsWith("mailto:") || url.toLowerCase().endsWith(".css") || url.toLowerCase().endsWith(".pdf")) {
                    resolve({
                        url: url,
                        result: "OMIT",
                        referrer,
                        status: 0
                    })
                }

                resolve({
                    url: url,
                    result: "ERROR",
                    referrer,
                    status: 0
                });
            });
        });
    }
}

/**
 * Formats a report and returns a string.
 * @param {{ok: Array<{url: string, result: "OK"|"WARN"|"ERROR", referrer: string, status: number, next?: Array<string>}>, warn: Array<{url: string, result: "OK"|"WARN"|"ERROR", referrer: string, status: number, next?: Array<string>}>, error: Array<{url: string, result: "OK"|"WARN"|"ERROR", referrer: string, status: number, next?: Array<string>}>}} report
 */
const formatReport = (report) => {
    let ok = `OK (${report.ok.length}):\n`;
    report.ok.forEach(result => {
        ok += `${result.url} from ${result.referrer}\n`
    });
    if (report.ok.length == 0) ok += "-- NONE --\n";

    let warn = `WARN (${report.warn.length}):\n`;
    report.warn.forEach(result => {
        warn += `${result.url} from ${result.referrer}\n`
    });
    if (report.warn.length == 0) warn += "-- NONE --\n";

    let error = `ERROR (${report.error.length}):\n`;
    report.error.forEach(result => {
        error += `${result.url} from ${result.referrer}\n`
    });
    if (report.error.length == 0) error += "-- NONE --\n";

    return `${ok}\n${warn}\n${error}\n\n${report.omit.length} URLs were scanned but ommited.`;
};