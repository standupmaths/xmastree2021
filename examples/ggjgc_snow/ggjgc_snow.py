# Here are the libraries I am currently using:
import random
from typing import Dict, List

# You are welcome to add any of these:
# import time
# import math
# import random
# import numpy
# import scipy
# import sys

from matts_tree_helpers import get_coords_pixels, FrameManager


def snow():
    # NOTE THE LEDS ARE GRB COLOUR (NOT RGB)

    # If you want to have user changeable values, they need to be entered from the command line
    # so import sys and use sys.argv[0] etc.
    # some_value = int(sys.argv[0])

    coords, pixels = get_coords_pixels("coords_2021.csv")

    # YOU CAN EDIT FROM HERE DOWN

    y_coords = list(zip(*coords))[2]
    max_y = max(y_coords)
    min_y = min(y_coords)
    tree_height = max_y - min_y

    colour = (255, 255, 255)

    frame_time = 1 / 7

    # The max distance that should be considered a neighbour LED
    max_dist = 0.2 * tree_height

    # the number of brightness steps and the number of frames it takes the LED to turn off
    steps = 5

    pixel_colours: Dict[int, int] = dict.fromkeys(range(len(coords)), 0)
    next_leds: Dict[int, List[int]] = {}  # track which is the next LED in the chain

    # precompute the closest LEDs below each led
    for led1, coord1 in enumerate(coords):
        # for each LED
        led_data = []
        for led2, coord2 in enumerate(coords):
            if coord2[2] < coord1[2]:
                # if it is below the current LED
                dist = sum((c2 - c1) ** 2 for c1, c2 in zip(coord1, coord2)) ** 0.5
                if dist < max_dist:
                    # if within the max distance
                    led_data.append((dist, led2))
        led_data = sorted(led_data, key=lambda x: x[0])[:5]
        if led_data:
            _, leds = zip(*led_data)
        else:
            leds = []
        next_leds[led1] = leds

    # find the LEDs that are in the top third of the tree
    start_leds = [
        led for led, coord in enumerate(coords) if coord[2] > max_y - tree_height / 3
    ]

    while True:
        with FrameManager(frame_time):
            new_pixel_colours: Dict[int, int] = dict.fromkeys(range(len(coords)), 0)
            for i, v in pixel_colours.items():
                if v > 1:
                    if v == steps and next_leds[i]:
                        new_pixel_colours[random.choice(next_leds[i])] = steps
                    new_pixel_colours[i] = max(new_pixel_colours[i], v - 1)
            pixel_colours = new_pixel_colours

            # calculate the colour for each pixel
            for i, v in pixel_colours.items():
                pixels[i] = tuple(c * v / steps for c in colour)

            # use the show() option as rarely as possible as it takes ages
            # do not use show() each time you change a LED but rather wait until you have changed them all
            pixels.show()

            # if not any(pixel_colours.values()):
            pixel_colours[random.choice(start_leds)] = steps


if __name__ == "__main__":
    snow()
