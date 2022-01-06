# Here are the libraries I am currently using:
import time
from colorsys import hsv_to_rgb
import math

# You are welcome to add any of these:
# import random
# import numpy
# import scipy
# import sys

from matts_tree_helpers import get_coords_pixels, FrameManager


def rainbow_spiral():
    # NOTE THE LEDS ARE GRB COLOUR (NOT RGB)

    # If you want to have user changeable values, they need to be entered from the command line
    # so import sys and use sys.argv[0] etc.
    # some_value = int(sys.argv[0])

    coords, pixels = get_coords_pixels("coords_2021.csv")

    # YOU CAN EDIT FROM HERE DOWN

    speed = 0.1

    frame_time = 1 / 30

    y_coords = list(zip(*coords))[2]
    max_y = max(y_coords)
    min_y = min(y_coords)

    turns = 3

    while True:
        with FrameManager(frame_time):
            # calculate the colour for each pixel
            t = time.time()
            for i, coord in enumerate(coords):
                tree_offset = (coord[2] - min_y) / (max_y - min_y)
                tree_angle = math.atan2(coord[0], coord[1]) / (2 * math.pi)
                # I don't fully understand this. I just wrote code until I got it to work
                hue = (
                    int(tree_angle + tree_offset * turns) / turns
                    - speed * t
                    - tree_angle / turns
                )
                rgb = hsv_to_rgb(hue % 1, 1, 1)
                pixels[i] = (255 * rgb[1], 255 * rgb[0], 255 * rgb[2])

            # use the show() option as rarely as possible as it takes ages
            # do not use show() each time you change a LED but rather wait until you have changed them all
            pixels.show()


if __name__ == "__main__":
    rainbow_spiral()
