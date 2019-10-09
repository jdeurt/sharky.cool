import sys
from Log import Log

combined_file_uuid = sys.argv[1]
uuids = sys.argv[2:]
logs = []

combined_log = open("/tmp/logify_" + combined_file_uuid + ".log", "w+")

for uuid in uuids:
    log = Log("/tmp/logify_" + uuid + ".log")

    combined_log.write("\n".join(log.lines) + "\n")

combined_log.close()

print("done")
