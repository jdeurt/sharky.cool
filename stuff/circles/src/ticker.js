/**
 * Return something falsy in your callback to stop the loop.
 */
function createTimer(delay = 500, cb = function() {}) {
    let willContinue = cb();

    if (!willContinue) return;

    window.setTimeout(function() {
        createTimer(delay, cb);
    }, delay);
}