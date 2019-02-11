module.exports = {
    all: require("./get-all")
};

require("./get-all")({params: {
    year: 2018
}});