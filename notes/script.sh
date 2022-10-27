cd $1
printf "file '%s'\n" * > file.txt
ffmpeg -f concat -safe 0 -i file.txt -c copy output.avi
