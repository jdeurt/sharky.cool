import datetime
import re
from utils import try_except

class Log:
    def __init__(self, file_location):
        self.file = open(file_location, "r")

        self.lines = []
        for line in self.file:
            self.lines.append(line.strip())

        self.file.close()

class Fix:
    def __init__(self, log):
        self.log = log

        self.lines = []

        for line in self.log.lines:
            date = try_except(lambda: re.search(r"\d+/\d+/\d+", line)[0], None)
            line = line.replace("L " + date, "")

            time = try_except(lambda: re.search(r"\d+:\d+:\d+", line)[0], None)
            line = line.replace(" - " + time, "")

            player = {
                "name": None,
                "id": None
            }
            player_r = re.search(r": \"(.+?)<\d+><(\[\w:\d:\d+\])><\w+>\"", line)
            if player_r != None:
                player["name"] = player_r[1]
                player["id"] = player_r[2]
                line = line.replace(player_r[0] + " ", "")
            else:
                line = line.replace(": World ", "")

            action = try_except(lambda: re.search(r"(.+?) \"", line)[1], None)
            line = line.replace(action + " ", "")

            action_item = try_except(lambda: re.search(r"\"(.+?)\"", line)[1], None)
            line = line.replace("\"" + action_item + "\" ", "")

            target = {
                "name": None,
                "id": None
            }
            target_r = re.search(r"against \"(.+?)<\d+><(\[\w:\d:\d+\])><\w+>\" ", line)
            if target_r != None:
                target["name"] = target_r[1]
                target["id"] = target_r[2]
                line = line.replace(target_r[0], "")
            
            details = []
            details_r = re.findall(r"\((.+?)\)", line)
            if len(details_r) > 0:
                for detail_pair in details_r:
                    detail_name = re.search(r"(\w+) ", detail_pair)[1]
                    detail_description = re.search(r"(.+?)", detail_pair)[1]
                    details.append({
                        "name": detail_name,
                        "description": detail_description
                    })
            
            data = {
                "date": date,
                "time": time,
                "player": player,
                "action": action,
                "action_item": action_item,
                "target": target,
                "details": details
            }

    @staticmethod
    def _timestamp_sort_key(line):
        date_list = re.search(r"\d+/\d+/\d+", line)[0].split("/")
        time_list = re.search(r"\d+:\d+:\d+", line)[0].split(":")
        timestamp = datetime.datetime(
            int(date_list[2]),
            int(date_list[1]),
            int(date_list[0]),
            int(time_list[0]),
            int(time_list[1]),
            int(time_list[2])
        ).timestamp()

        return timestamp

    def timestamps(self):
        return sorted(self.log.lines, key = self._timestamp_sort_key)
