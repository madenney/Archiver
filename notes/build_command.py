# Written by Altafen
# Used as reference to write code for invisible mango video

filename_1 = "combo_invis.avi"
filename_2 = "combo_normal.avi"
filename_audio = "combo_audio.mkv"
cut_points = [
	0.966, 1.383, #whiffed fair
	2.416, 2.600, #punished fair
	3.783, 4.166, #hit pill
	4.433, 4.916, #hit ftilt
	5.366, 5.683, #hit pill
	6.500, 6.700, #hit utilt
	8.266, 8.483, #hit pill
	8.883, 9.050, #hit dashatk
	9.683, 9.950, #hit utilt
	12.266, 13.883, #hit sideb to upb
	16.083, 16.600, #uair
	19.333, 21.200, #job here is done lmao
	22.450 #end of stock
]


command = f'ffmpeg -i {filename_1} -i {filename_2} -filter_complex "'

count = 0
current_time = 0
current_video = 0
for cut in cut_points:
	command += f'[{current_video}:v]trim={current_time}:{cut},setpts=PTS-STARTPTS[v{count}]; '
	current_video = 1 - current_video
	current_time = cut
	count += 1

for i in range(count):
	command += f'[v{i}]'
command += f'concat=n={count}:v=1:a=0[out]" -map "[out]" output.mp4'

import os, time
os.system("del output.mp4 output_sound.mp4 *.png")
time.sleep(1)
os.system(command)
time.sleep(1)
# os.system("ffmpeg -i output.mp4 %04d.png") #quite slow, for looking at individual frames
time.sleep(1)
os.system(f"ffmpeg -i output.mp4 -itsoffset 0.08 -i {filename_audio} -c copy -map 0:v:0 -map 1:a:0 -shortest output_sound.mp4")