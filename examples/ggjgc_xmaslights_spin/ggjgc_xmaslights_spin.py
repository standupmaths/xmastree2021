# Here are the libraries I am currently using:
import math

# You are welcome to add any of these:
# import time
# import random
# import numpy
# import scipy
# import sys

from matts_tree_helpers import get_coords_pixels, FrameManager


def xmaslight():
    # NOTE THE LEDS ARE GRB COLOUR (NOT RGB)

    # If you want to have user changeable values, they need to be entered from the command line
    # so import sys and use sys.argv[0] etc.
    # some_value = int(sys.argv[0])

    coords, pixels = get_coords_pixels("coords_2021.csv")

    # YOU CAN EDIT FROM HERE DOWN

    # I get a list of the heights which is not overly useful here other than to set the max and min altitudes
    heights = [i[2] for i in coords]

    # find the height bounds
    min_alt = min(heights)
    max_alt = max(heights)

    # VARIOUS SETTINGS

    # a buffer so it does not hit to extreme top or bottom of the tree
    buffer = (max_alt - min_alt) / 10

    # pause between cycles. Each frame should be at least this long.
    # if it takes loner than this to compute the frame then it won't sleep at the end.
    frame_time = 1 / 30

    # starting angle (in radians)
    angle = 0

    # how much the angle changes per cycle
    angle_change = 0.1

    # the two colours in GRB order
    # if you are turning a lot of them on at once, keep their brightness down please
    colour_a = [0, 50, 50]  # purple
    colour_b = [50, 50, 0]  # yellow

    # INITIALISE SOME VALUES

    # the starting point on the vertical axis
    c = (max_alt - min_alt) / 2
    # the amount the c value changes each frame
    dc = (max_alt - min_alt) * 0.003

    # Run forever
    while True:
        with FrameManager(frame_time):
            # calculate the colour for each pixel
            tan = math.tan(angle)
            for led, coord in enumerate(coords):
                pixels[led] = [colour_b, colour_a][
                    # is the point above the line
                    (tan * coord[1] + c <= coord[2])
                    # The bit below handles flipping the colours when passing the vertical point
                    # xor the above with if we are 1/4 to 3/4 through the rotation
                    != (0.5 * math.pi < angle < 1.5 * math.pi)
                ]

            # use the show() option as rarely as possible as it takes ages
            # do not use show() each time you change a LED but rather wait until you have changed them all
            pixels.show()

            # now we get ready for the next cycle

            angle += angle_change
            if angle > 2 * math.pi:
                angle -= 2 * math.pi

            # and we move the rotation point
            c += dc

            # if it gets near the top or bottom of the tree invert the direction
            if not min_alt + buffer <= c <= max_alt - buffer:
                dc *= -1


if __name__ == "__main__":
    xmaslight()
