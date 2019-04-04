/**
 * Get the URL parameters
 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
function getParams(url) {
	let params = {};
	let parser = document.createElement("a");
	parser.href = url;
	let query = parser.search.substring(1);
	let vars = query.split("&");
	for (let i = 0; i < vars.length; i++) {
		let pair = vars[i].split("=");
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};


const params = new getParams(window.location.href);

window.BPM = params.bpm ? Number(params.bpm) : 120;
window.SPEED = params.s ? Number(params.s) : 100;
window.CONTROLLED = params.c ? Boolean(params.c) : false;