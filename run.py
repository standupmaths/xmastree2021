#!/usr/bin/env python3

"""
Usage: run.py <file> [brightness_factor]

file: The GIFT file to play
brightness_factor: (optional) factor to multiply all brightness values with. All values clamped at 255.
"""

import board
import csv
import neopixel
import sys
import time 


NUMBER_OF_LEDS = 500
FRAME_TIME = 1 / 30

pixels = neopixel.NeoPixel(board.D18, NUMBER_OF_LEDS, auto_write=False, pixel_order=neopixel.RGB)

csv_file = sys.argv[1]

brightness_factor = 1.
if len(sys.argv) >= 3:
    brightness_factor = float(sys.argv[2])


# load csv
frames = []

with open(csv_file, 'r') as file:
    # pass the file object to reader() to get the reader object
    csv_reader = csv.reader(file)

    # skip header row
    next(csv_reader)

    for row in csv_reader:
        values = [
            min(255, # clamp at 255
                int(
                    float(x) * brightness_factor
                )
            )
            for x in row[1:] # skip first column (FRAME_ID)
        ]
        frames.append([(values[i+0], values[i+1], values[i+2]) for i in range(0, len(values), 3)])

print("Finished Parsing")



# run the code on the tree
frame_start = time.time()

f = 0
while f < len(frames):
    #print("running frame " + str(f))
    
    pixels[:] = frames[f]
    pixels.show()

    f += 1
    
    # sleep to wait for next frame
    frame_start += FRAME_TIME
    sleep_time = frame_start - time.time()
    if sleep_time > 0.:
        time.sleep(sleep_time)
    
    # skip frames if lagging behind
    elif sleep_time < -FRAME_TIME:
        skip = int(-sleep_time // FRAME_TIME)
        f += skip
        frame_start += skip * FRAME_TIME
