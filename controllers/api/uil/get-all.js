const cheerio = require("cheerio");
const got = require("got");
const toTable = require("text-table");
const path = require("path");
const fs = require("fs");

module.exports = async (req, res) => {
    const BASE_URL = "http://utdirect.utexas.edu/uil/vlcp_pub_arch.WBX";
    const EVENTS = [
        "SCI", // Science
        "MTH", // Math
        "NUM", // Number Sense
        "CAL", // Calculator
        "CSC"  // Computer Science
    ];
    const CONFERENCES = [
        "1A",
        "2A",
        "3A",
        "4A",
        "5A",
        "6A"
    ];
    const LEVELS = [
        "D", // District
        "R", // Regional
        "S"  // State
    ];


    let response = {};

    for(let eventIndex = 0; eventIndex < EVENTS.length; eventIndex++) {
        for(let confIndex = 0; confIndex < CONFERENCES.length; confIndex++) {
            for(let levelIndex = 0; levelIndex < LEVELS.length; levelIndex++) {
                let previousInnerHTML = "";
                let fullText = "";
                for(let rNum = 1; rNum < 1000; rNum++) {
                    let response = await got(
                        `${BASE_URL}
                        ?s_year=${req.params.year}
                        &s_conference=${CONFERENCES[confIndex]}
                        &s_level_id=${LEVELS[levelIndex]}
                        &s_level_nbr=${rNum}
                        &s_event_abbr=${EVENTS[eventIndex]}
                        &s_submit_sw=X
                        &s_dept=C`
                    );

                    let $ = cheerio.load(response.body);

                    let $table1 = $("#fullpage > form > table:nth-child(18)");
                    let $table2 = $("#fullpage > form > table:nth-child(20)");
                    let $table3 = $("#fullpage > form > table:nth-child(22)");

                    if (!$table1.length) break;
                    if ($table1.html() == previousInnerHTML) break;
                    previousInnerHTML = $table1.html();

                    console.log(`${EVENTS[eventIndex]} ${CONFERENCES[confIndex]} ${LEVELS[levelIndex]} ${rNum}`);

                    fullText += `(region num: ${rNum})\n\n`

                    let separator = "-".repeat(30);
                    let textOutput = `INDIVIDUAL RESULTS\n${separator}\n`;
                    
                    let table = [];
                    $table1.find("tbody > tr").each((rowIndex, row) => {
                        let tableRow = [];
                        $(row).find("td").each((colIndex, col) => {
                            tableRow.push($(col).text().trim());
                        });
                        table.push(tableRow);
                    });

                    textOutput += `${toTable(table)}\n\n`;

                    textOutput += `TOP SCORERS\n${separator}\n`;

                    table = [];
                    $table2.find("tbody > tr").each((rowIndex, row) => {
                        let tableRow = [];
                        $(row).find("td").each((colIndex, col) => {
                            tableRow.push($(col).text().trim());
                        });
                        table.push(tableRow);
                    });

                    textOutput += `${toTable(table)}\n\n`;

                    textOutput += `TEAM RESULTS\n${separator}\n`;

                    table = [];
                    $table3.find("tbody > tr").each((rowIndex, row) => {
                        let tableRow = [];
                        $(row).find("td").each((colIndex, col) => {
                            tableRow.push($(col).text().trim());
                        });
                        table.push(tableRow);
                    });

                    textOutput += `${toTable(table)}\n\n`;

                    fullText += textOutput

                    console.log("done");
                }
                let outputPath = path.resolve(`${__dirname}/../../../stuff/UIL/${EVENTS[eventIndex]}_${CONFERENCES[confIndex]}_${LEVELS[levelIndex]}.txt`);

                fs.writeFileSync(outputPath, fullText);
            }
        }
    }
};