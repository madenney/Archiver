#!/usr/bin/env python
"""
Delete files listed in input file.
Usage: delete.py file.txt
"""

import sys
import os

def delete_from_file(file_path):

    with open(file_path) as file:
        lines = [line.rstrip() for line in file]

    for line in lines:
        print("Deleting " + line)
        if os.path.exists(line):
            os.remove(line)
        else:
            print(line + " does not exist.")
        


if __name__ == "__main__":
    if sys.argv[1:]:
        delete_from_file(sys.argv[1])
    else:
        print("Usage: %s file.txt" % sys.argv[0])