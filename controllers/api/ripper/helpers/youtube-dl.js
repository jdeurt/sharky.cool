const ytdl = require("youtube-dl");
const concat = require("concat-stream");

/**
 * Downloads a video from a URL
 * @param {string} url 
 * @returns {Promise<Buffer>}
 */
async function bufferFromUrl(url) {
    const video = ytdl(url, [
        "--format=mp4"
    ]);

    // let size = 0;
    // video.on("info", info => {
    //     size = info.size;
    // });

    // let pos = 0;
    // video.on("data", chunk => {
    //     pos += chunk.length;
    //     if (size) {
    //         let percent = (pos / size * 100).toFixed(2);
    //         console.log(percent + "%");
    //     }
    // });

    return new Promise((resolve, reject) => {
        video.pipe(concat(buffer => {
            resolve(buffer);
        }));

        video.on("error", reject);
    });
}

/**
 * Downloads a video from a URL
 * @param {string} url
 * @param {WritableStream} writeStream 
 * @returns {Promise<Stream>}
 */
function streamFromUrl(url, writeStream) {
    const video = ytdl(url, [
        "--format=mp4"
    ]);

    video.on("error", err => {
        console.error(err);
        throw err;
    });

    video.pipe(writeStream);
}

module.exports = {
    bufferFromUrl,
    streamFromUrl
};