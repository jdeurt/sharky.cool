const got = require("got");
const cheerio = require("cheerio");
const s = require("./helpers/selectors");

/**
 * GET /api/rgl/player/:id
 * -> http://rgl.gg/Public/PlayerProfile.aspx?p=:id
 */
module.exports = async (req, res) => {
    const steamId = req.params.id;
    const rglUrl = `http://rgl.gg/Public/PlayerProfile.aspx?p=${steamId}`;

    const rglPlayerProfile = await got.get(rglUrl);
    const body = rglPlayerProfile.body;

    const $ = cheerio.load(body);

    const trophiesRaw = $(s.player.trophies).text().split(/\s+/);

    const name = $(s.player.name).text();
    const verified = $(s.player.verified).length === 1;
    const totalEarnings = $(s.player.totalEarnings).text() || "$0";
    const trophies = {
        gold: trophiesRaw[0] || 0,
        silver: trophiesRaw[1] || 0,
        bronze: trophiesRaw[2] || 0
    };
    const experience = [];

    $(s.player.leagueHeading).each((i, heading) => {
        /**
         * Category - RGL - Format
         */
        const $h = $(heading);
        const hText = $h.text();
        const hTextParts = hText.split(" - ");

        const category = hTextParts[0].toLowerCase();
        const format = hTextParts[2].toLowerCase();

        const $t = $h.parent().nextAll(s.player.leagueTable._).first();

        const seasons = $t.find(s.player.leagueTable.season).map((i, elem) => $(elem).text().trim());
        const divs = $t.find(s.player.leagueTable.div).map((i, elem) => $(elem).text().trim());
        const teams = $t.find(s.player.leagueTable.team).map((i, elem) => $(elem).text().trim());
        const endRanks = $t.find(s.player.leagueTable.endRank).map((i, elem) => $(elem).text().trim());
        const recordsWith = $t.find(s.player.leagueTable.recordWith).map((i, elem) => $(elem).text().trim());
        const recordsWithout = $t.find(s.player.leagueTable.recordWithout).map((i, elem) => $(elem).text().trim());
        const amountsWon = $t.find(s.player.leagueTable.amountWon).map((i, elem) => $(elem).text().trim());
        const joined = $t.find(s.player.leagueTable.joined).map((i, elem) => $(elem).text().trim());
        const left = $t.find(s.player.leagueTable.left).map((i, elem) => $(elem).text().trim());

        for (let i = 0; i < seasons.length; i++) {
            experience.push(
                {
                    category,
                    format,
                    season: seasons[i],
                    div: divs[i],
                    team: teams[i],
                    endRank: endRanks[i],
                    recordWith: recordsWith[i],
                    recordWithout: recordsWithout[i],
                    amountWon: amountsWon[i],
                    joined: joined[i],
                    left: left[i],
                    isCurrentTeam: left[i] === ""
                }
            );
        }
    });

    res.json({
        name,
        verified,
        totalEarnings,
        trophies,
        experience
    });
};