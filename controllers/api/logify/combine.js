const http = require("http");
const fs = require("fs");
const exec = require("child_process").exec;
const uuid = require("uuid/v4");
const zlib = require("zlib");
const FormData = require("form-data");

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
        return res.status(400).json({
            success: false,
            error: "Missing \"token\" body parameter."
        });
    } else if (!req.body.title) {
        return res.status(400).json({
            success: false,
            error: "Missing \"title\" body parameter."
        });
    } else if (!req.body.map) {
        return res.status(400).json({
            success: false,
            error: "Missing \"map\" body parameter."
        });
    } else if (!req.body.ids) {
        return res.status(400).json({
            success: false,
            error: "Missing \"ids\" body parameter."
        });
    } else if (!Array.isArray(req.body.ids)) {
        return res.status(400).json({
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
    const combinedFileUuid = uuid();

    const cleanup = () => {
        uuids.forEach(uuid => {
            try {
                fs.unlinkSync(`${TEMP_DIR}/logify_${uuid}.log`);
            } catch (err) { /* Nothing */ }
        });

        try {
            fs.unlinkSync(`${TEMP_DIR}/logify_${combinedFileUuid}.log`);
        } catch (err) { /* Nothing */ }
    };

    /**
     * - Zipped log location: http://logs.tf/logs/log_<LOG_ID>.log.zip
     */

    let errored = false;

    logIds.forEach(id => {
        const logUuid = uuid();
        const logFileDest = `${TEMP_DIR}/logify_${logUuid}.log`;
        const logFile = fs.createWriteStream(logFileDest);
        const unzipper = zlib.createGunzip();

        http.get(`https://logs.tf/logs/log_${id}.log.zip`, response => {
            response.pipe(unzipper).pipe(logFile);

            logFile.on("finish", () => {
                logFile.close();

                uuids.push([id, logUuid]);
            });
        }).on("error", err => {
            errored = id;

            fs.unlinkSync(logFileDest);
        });
    });

    if (errored) {
        cleanup();

        return res.status(500).json({
            success: false,
            error: `Error downloading log with ID: ${errored}.`
        });
    }

    const timeoutMs = 1000 * 30;
    let msElapsed = 0;
    const interval = setInterval(() => {
        if (uuids.length != logIds.length) {
            msElapsed += 100;

            if (msElapsed >= timeoutMs) {
                clearInterval(interval);

                cleanup();

                res.status(408).json({
                    success: false,
                    error: "Request timed out while downloading log files."
                });
            }

            return;
        }

        exec(`python3 ${__dirname}/py/main.py ${combinedFileUuid} ${uuids.join(" ")}`, err => {
            if (err) {
                cleanup();

                return res.status(500).json({
                    success: false,
                    error: "An error occured while combining logs (python sub-process)."
                });
            }

            const form = new FormData();
            form.append("title", logTitle);
            form.append("map", logMap);
            form.append("key", apiKey);
            form.append("logfile", fs.createReadStream());

            const apiRequest = http.request({
                method: "POST",
                host: "https://logs.tf",
                path: "/upload",
                headers: form.getHeaders()
            }, response => {
                response.on("data", data => {
                    try {
                        res.json(JSON.parse(data));
                    } catch (err) {
                        res.status(500).json({
                            success: false,
                            error: "An error occured in the upload request to logs.tf."
                        });
                    }

                    cleanup();
                });
            });

            form.pipe(apiRequest);
        });
    }, 100);
};