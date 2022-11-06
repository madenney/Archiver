#!/usr/bin/env python
"""
Removes duplicate slp files.
Usage: duplicates.py <folder>
"""

import subprocess
import sys
import hashlib
import glob
import json

peppi_command = "/home/matt/Projects/peppi-slp/target/release/slp -r last "

def get_hash(filename, hash_algo=hashlib.sha1):
    hashobj = hash_algo()
    return hashobj.digest()


def check_for_duplicates(path):

    files = glob.glob(path + '/**/*.slp', recursive=True)
    print("Found " + str(len(files)) + " slp files.")


    frames_hashes = dict()
    hash_algo=hashlib.sha1
    duplicates = []

    for file in files:
        print(file)
        game_json = json.loads(subprocess.check_output(peppi_command + '"'+file+'"', shell=True))
        frames = game_json["frames"]
        print(json.dumps(frames[0]))
        frames_hash = str(hash(json.dumps(frames[0])))
        #print(frames_hash)
        
        if frames_hash in frames_hashes:
            duplicates.append(file)
        else:
            frames_hashes[frames_hash] = file
    
    print(frames_hashes)
    print("Duplicates: ")
    for d in duplicates:
        print(d)
        

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