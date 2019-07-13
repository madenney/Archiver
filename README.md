








# Notes to save me time later:

installing ffmpeg-concat
- npm install --global --production windows-build-tools
- npm install --save-dev  --python=python2.7 ffmpeg-concat 
- https://stackoverflow.com/questions/41695251/c-microsoft-cpp-default-props-was-not-found/51549345


GL TRANSITIONS:
https://gl-transitions.com/gallery?page=5


(echo file 'game_1.mp4' & echo file 'game_2.mp4' )>list.txt
ffmpeg -safe 0 -f concat -i list.txt -c copy output.mp4