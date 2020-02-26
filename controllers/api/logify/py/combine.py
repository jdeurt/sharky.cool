import sys
from Log import Log

session_uuid = sys.argv[1]
ids = sys.argv[2:]
logs = []

combined_log = open("/tmp/logify_" + session_uuid + "/logify_" + session_uuid + ".log", "w+")

for id_pair in ids:
    id_pairs = id_pair.split("_")

    log = Log("/tmp/logify_" + session_uuid + "/log_" + id_pairs[0] + ".log")

    combined_log.write("\n".join(log.lines) + "\n")

combined_log.close()

print("done")
