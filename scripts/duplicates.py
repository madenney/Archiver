#!/usr/bin/env python
"""
Detects duplicates and invalid slp files.
Usage: duplicates.py <folder>
"""
from os.path import abspath
import subprocess
import sys
import hashlib
import glob
import json

peppi_command = "/home/matt/Projects/peppi-slp-0.3.2/target/release/slp -r last "
dupes_file = "/home/matt/Projects/output/dupes.txt"


def check_for_duplicates(path):

    files = glob.glob(path + '/**/*.slp', recursive=True)
    print("Found " + str(len(files)) + " slp files.")


    hashes = dict()
    duplicates = []

    for file in files:
        print(file)
        game_json = json.loads(subprocess.check_output(peppi_command + file, shell=True))
        frames = game_json["frames"]
        inputs = []

        #Note: This will also include files with zero inputs as duplicates
        for frame in frames:
            inputs.append(frame["ports"][0]["leader"]["pre"]["position"]["x"])

        inputs_hash = str(hash(str(inputs)))

        if inputs_hash in hashes:
            duplicates.append(file)
        else:
            hashes[inputs_hash] = file
    
    print("# Duplicates: " + str(len(duplicates)))
    f = open(dupes_file, "a")
    for d in duplicates:
        f.write(abspath(d) + "\n")
    f.close()


if __name__ == "__main__":
    if sys.argv[1:]:
        check_for_duplicates(sys.argv[1])
    else:
        print("Usage: %s <folder>" % sys.argv[0])