const http = require("http");
const fs = require("fs");
const exec = require("child_process").exec;
const uuid = require("uuid/v4");
const unzip = require("unzip-stream");
const FormData = require("form-data");
const got = require("got");

const TEMP_DIR = "/tmp";

module.exports = (req, res) => {
    /**
     * Request format (POST):
     *      Body:
     *          - token: the logs.tf API token
     *          - title: the log title
     *          - map: the name of the map(s)
     *          - ids: an array of log IDs
     */

    if (!req.body.token) {
        return res.json({
            success: false,
            error: "Missing \"token\" body parameter."
        });
    } else if (!req.body.title) {
        return res.json({
            success: false,
            error: "Missing \"title\" body parameter."
        });
    } else if (!req.body.map) {
        return res.json({
            success: false,
            error: "Missing \"map\" body parameter."
        });
    } else if (!req.body.ids) {
        return res.json({
            success: false,
            error: "Missing \"ids\" body parameter."
        });
    } else if (!Array.isArray(req.body.ids)) {
        return res.json({
            success: false,
            error: "\"ids\" body parameter must be an array."
        });
    }

    /**
     * @type {string}
     */
    const apiKey = req.body.token;
    /**
     * @type {string}
     */
    const logTitle = req.body.title;
    /**
     * @type {string}
     */
    const logMap = req.body.map;
    /**
     * @type {string[]}
     */
    const logIds = req.body.ids;

    const uuids = [];
    const sessionUuid = uuid();
    const sessionDir = `${TEMP_DIR}/logify_${sessionUuid}`;

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir);
    }

    const cleanup = () => {
        uuids.forEach(uuid => {
            try {
                fs.unlinkSync(`${sessionDir}/logify_${uuid}.log`);
            } catch (err) { /* Nothing */ }
        });

        try {
            fs.unlinkSync(`${sessionDir}/logify_${sessionUuid}.log`);
        } catch (err) { /* Nothing */ }

        try {
            fs.unlinkSync(sessionDir);
        } catch (err) { /* Nothing */ }
    };

    /**
     * - Zipped log location: http://logs.tf/logs/log_<LOG_ID>.log.zip
     */

    let errored = false;

    logIds.forEach(id => {
        const logUuid = uuid();
        const logFileZipDest = `${sessionDir}/log_${id}.log.zip`;

        http.get(`http://logs.tf/logs/log_${id}.log.zip`, response => {
            if (response.headers["content-type"] !== "application/zip") {
                errored = id;

                uuids.push([id, logUuid]);

                try {
                    fs.unlinkSync(logFileZipDest);
                } catch (err) { /* Nothing*/ }

                return;
            }

            response.pipe(unzip.Extract({
                path: sessionDir
            })).on("close", () => {
                uuids.push([id, logUuid]);
            }).on("error", err => {
                errored = id;

                uuids.push([id, logUuid]);

                try {
                    fs.unlinkSync(logFileZipDest);
                } catch (err) { /* Nothing*/ }
            });
        }).on("error", err => {
            errored = id;

            uuids.push([id, logUuid]);

            try {
                fs.unlinkSync(logFileZipDest);
            } catch (err) { /* Nothing*/ }
        });
    });

    const timeoutMs = 1000 * 30;
    let msElapsed = 0;
    const interval = setInterval(() => {
        if (uuids.length != logIds.length) {
            msElapsed += 100;

            if (msElapsed >= timeoutMs) {
                clearInterval(interval);

                cleanup();

                res.json({
                    success: false,
                    error: "Request timed out while downloading log files."
                });
            }

            return;
        }

        if (errored) {
            cleanup();
    
            return res.json({
                success: false,
                error: `Error downloading log with ID: ${errored}.`
            });
        }

        exec(`python3 ${__dirname}/py/main.py ${sessionUuid} ${uuids.map(ids => `${ids[0]}_${ids[1]}`).join(" ")}`, err => {
            if (err) {
                cleanup();

                return res.json({
                    success: false,
                    error: "An error occured while combining logs (python sub-process)."
                });
            }

            const form = new FormData();
            form.append("title", logTitle);
            form.append("map", logMap);
            form.append("key", apiKey);
            form.append("logfile", fs.createReadStream(`${sessionDir}/logify_${sessionUuid}.log`));
            form.append("uploader", "Logify v4.0.8")

            got.post("http://logs.tf/upload", {
                headers: form.getHeaders(),
                body: form,
                throwHttpErrors: false
            }).then(response => {
                res.json(JSON.parse(response.body));

                cleanup();
            }).catch(err => {
                res.json({
                    success: false,
                    error: "An error occured in the upload request to logs.tf."
                });

                cleanup();
            });
        });

        clearInterval(interval);
    }, 100);
};