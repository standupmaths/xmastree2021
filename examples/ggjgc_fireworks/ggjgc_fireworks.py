# Here are the libraries I am currently using:
from typing import Tuple
from dataclasses import dataclass
import random
from colorsys import hsv_to_rgb as hsv_to_rgb

# You are welcome to add any of these:
# import numpy
# import time
# import math
# import scipy
# import sys

from matts_tree_helpers import get_coords_pixels, FrameManager


def hue_to_rgb(hue):
    return tuple(int(a*255) for a in hsv_to_rgb(hue, 1, 1))


@dataclass
class Particle:
    position: Tuple[float, float, float] = (0, 0, 0)
    velocity: Tuple[float, float, float] = (0, 0, 0)
    colour: Tuple[int, int, int] = (0, 0, 0)


def fireworks():
    # NOTE THE LEDS ARE GRB COLOUR (NOT RGB)

    # If you want to have user changeable values, they need to be entered from the command line
    # so import sys and use sys.argv[0] etc.
    # some_value = int(sys.argv[0])

    coords, pixels = get_coords_pixels("coords_2021.csv")

    # YOU CAN EDIT FROM HERE DOWN

    # find some information about the tree
    y_coords = list(zip(*coords))[2]
    max_y = max(y_coords)
    min_y = min(y_coords)
    tree_height = max_y - min_y

    # config settings
    frame_time = 1 / 30
    particle_count = 100  # The number of particles
    particle_distance = tree_height * 0.1  # the maximum distance an LED can be considered near a particle
    particle_velocity = tree_height * 0.04  # the maximum velocity in each axis the particle can travel

    # the particle start position
    start = tuple(sum(ax)/len(coords) for ax in zip(*coords))

    while True:
        colours = [hue_to_rgb(random.random()) for _ in range(3)]
        particles = []
        for _ in range(particle_count):
            # generate a number of particles
            velocity = tuple(random.random()*2-1 for _ in range(3))
            mag = sum(v ** 2 for v in velocity) ** 0.5
            velocity = tuple(particle_velocity * v / mag for v in velocity)
            particles.append(
                Particle(
                    start,  # The start position of the particle
                    velocity,  # The velocity of the particle
                    random.choice(colours)  # The colour of the particle
                )
            )

        firework_has_particles = True  # Used to track if particles are still on the tree
        while firework_has_particles:
            with FrameManager(frame_time):
                # turn all the LEDs to off
                for i in range(len(coords)):
                    pixels[i] = (0, 0, 0)

                firework_has_particles = False
                # find which LED each particle is closest to
                for particle in particles:
                    dist = tree_height * 10
                    led = None
                    for i, coord in enumerate(coords):
                        led_dist = sum((c2 - c1) ** 2 for c1, c2 in zip(coord, particle.position)) ** 0.5
                        if led_dist < particle_distance and led_dist < dist:
                            led = i
                            dist = led_dist
                    if led is not None:
                        pixels[led] = particle.colour
                        firework_has_particles = True

                # use the show() option as rarely as possible as it takes ages
                # do not use show() each time you change a LED but rather wait until you have changed them all
                pixels.show()

                # update the particle location
                for particle in particles:
                    particle.position = tuple(sum(ax) for ax in zip(particle.position, particle.velocity))


if __name__ == "__main__":
    fireworks()
