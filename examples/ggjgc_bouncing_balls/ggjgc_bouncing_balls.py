# Here are the libraries I am currently using:
import random
from colorsys import hsv_to_rgb
import numpy

# You are welcome to add any of these:
# import time
# import math
# import random
# import scipy
# import sys

from matts_tree_helpers import get_coords_pixels, FrameManager


def bouncing_balls():
    # NOTE THE LEDS ARE GRB COLOUR (NOT RGB)

    # If you want to have user changeable values, they need to be entered from the command line
    # so import sys and use sys.argv[0] etc.
    # some_value = int(sys.argv[0])

    coords, pixels = get_coords_pixels("coords_2021.csv")

    # YOU CAN EDIT FROM HERE DOWN

    frame_time = 1 / 30

    ball_count = 10

    # find the bounds of the LEDs
    bounds = [(min(axis), max(axis)) for axis in zip(*coords)]
    tree_height = bounds[2][1] - bounds[2][0]

    ball_radius = 0.1 * tree_height
    speed = 0.2 * tree_height

    ball_locations = [
        [random.uniform(axis_min, axis_max) for axis_min, axis_max in bounds]
        for _ in range(ball_count)
    ]
    ball_velocities = []
    for _ in range(ball_count):
        v = numpy.random.rand(3) - 0.5
        ball_velocities.append(speed * v / numpy.linalg.norm(v))

    def hue_to_grb(hue):
        rgb = hsv_to_rgb(hue, 1, 1)
        return 255 * rgb[1], 255 * rgb[0], 255 * rgb[2]

    ball_colours = [hue_to_grb(i / ball_count) for i in range(ball_count)]

    while True:
        with FrameManager(frame_time):
            # find which ball each pixel is in (if any)
            for i, coord in enumerate(coords):
                for ball_location, ball_colour in zip(ball_locations, ball_colours):
                    if (
                        sum((bax - cax) ** 2 for bax, cax in zip(ball_location, coord))
                        ** 0.5
                        < ball_radius
                    ):
                        pixels[i] = ball_colour
                        break
                else:
                    pixels[i] = (0, 0, 0)

            # use the show() option as rarely as possible as it takes ages
            # do not use show() each time you change a LED but rather wait until you have changed them all
            pixels.show()

            # find the new ball locations
            for i, (ball_location, ball_velocity) in enumerate(
                zip(ball_locations, ball_velocities)
            ):
                ball_locations[i] = ball_location = [
                    loc + vel * frame_time
                    for loc, vel in zip(ball_location, ball_velocity)
                ]
                ball_velocities[i] = [
                    vel if axis_min < loc < axis_max else -vel
                    for loc, vel, (axis_min, axis_max) in zip(
                        ball_location, ball_velocity, bounds
                    )
                ]


if __name__ == "__main__":
    bouncing_balls()
