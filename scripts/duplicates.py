#!/usr/bin/env python
"""
Detects duplicates and invalid slp files.
Usage: duplicates.py <folder>

This uses the x inputs of player 1 to detect duplicates.
There must be a better way but this works for now.
"""
from os.path import abspath
import subprocess
import sys
import hashlib
import glob
import json

peppi_command = "/home/matt/Projects/peppi-slp/target/release/slp -r last "
dupes_file = "/home/matt/Projects/output/dupes.txt"
error_file = "/home/matt/Projects/output/error.txt"

def check_for_duplicates(path):

    files = glob.glob(path + '/**/*.slp', recursive=True)
    print("Found " + str(len(files)) + " slp files.")

    hashes = dict()
    duplicates = []

    for index, file in enumerate(files):
        print(str(index) + "/" + str(len(files)) + " - " + file)
        try:
            game_json = json.loads(subprocess.check_output(peppi_command + '"'+file+'"', shell=True))
            frames = game_json["frames"]
            inputs = []
            for frame in frames:
                inputs.append(frame["ports"][0]["leader"]["pre"]["position"]["x"])

            inputs_hash = str(hash(str(inputs)))

            if inputs_hash in hashes:
                duplicates.append(file)
            else:
                hashes[inputs_hash] = file
        except:
            ef = open(error_file, "a")
            print("An exception occurred")
            ef.write(abspath(file) + "\n")
            ef.close()
    
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