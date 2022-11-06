#!/usr/bin/env python
"""
Removes duplicate slp files.
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

def get_hash(filename, hash_algo=hashlib.sha1):
    hashobj = hash_algo()
    return hashobj.digest()


def check_for_duplicates(path):

    files = glob.glob(path + '/**/*.slp', recursive=True)
    print("Found " + str(len(files)) + " slp files.")


    hashes = dict()
    hash_algo=hashlib.sha1
    duplicates = []

    for file in files:
        print(file)
        game_json = json.loads(subprocess.check_output(peppi_command + file, shell=True))
        frames = game_json["frames"]
        inputs = []
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

        

    # file - collisions will be duplicates
    # for files in files_by_small_hash.values():
    #     if len(files) < 2:
    #         # the hash of the first 1k bytes is unique -> skip this file
    #         continue

    #     for filename in files:
    #         try:
    #             full_hash = get_hash(filename, first_chunk_only=False)
    #         except OSError:
    #             # the file access might've changed till the exec point got here
    #             continue

    #         if full_hash in files_by_full_hash:
    #             duplicate = files_by_full_hash[full_hash]
    #             print("Duplicate found:\n - %s\n - %s\n" % (filename, duplicate))
    #         else:
    #             files_by_full_hash[full_hash] = filename


if __name__ == "__main__":
    if sys.argv[1:]:
        check_for_duplicates(sys.argv[1])
    else:
        print("Usage: %s <folder>" % sys.argv[0])