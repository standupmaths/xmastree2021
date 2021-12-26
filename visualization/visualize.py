#!/usr/bin/env python3

from matplotlib import pyplot as plt
from matplotlib.animation import FuncAnimation
import argparse
import numpy as np
import random

class Animation:
    def __init__(self, coords_path, animation_path, interval=50):
        coords = self.load_csv(coords_path)
        self.x = coords[:, 0]
        self.y = coords[:, 1]
        self.z = coords[:, 2]

        self.animation = self.load_csv(animation_path, header=True)
        self.fig, self.ax = self.create_scaled_axis(coords)
        self.data = self.ax.scatter(self.x, self.y, self.z)
        self.interval = interval

    def run(self):
        ani = FuncAnimation(self.fig, self.update, frames=range(len(self.animation)), blit=True, interval=self.interval)
        plt.show()

    def update(self, frame_idx):
        frame = self.animation[frame_idx]
        self.data.set_color((random.random(), random.random(), random.random()))
        return [self.data]

    @staticmethod
    def load_csv(path, header=False):
        with open(path) as f:
            if header:
                f.readline()
            coords_raw = f.read().replace("\ufeff", "").strip()

        return np.array([[float(c) for c in row.split(",")] for row in coords_raw.split("\n")])

    @staticmethod
    def create_scaled_axis(coords):
        fig = plt.figure()
        ax = fig.add_subplot(projection='3d')

        # Set correct limits (we cannot automatically set aspect to equal)
        coords_min = coords.min(axis=0)
        coords_max = coords.max(axis=0)

        sizes = coords_max - coords_min
        max_size = sizes.max()

        margins = max_size - sizes

        ax.set_xlim(coords_min[0] - margins[0] / 2,
                    coords_max[0] + margins[0] / 2)
        ax.set_ylim(coords_min[1] - margins[1] / 2,
                    coords_max[1] + margins[1] / 2)
        ax.set_zlim(coords_min[2] - margins[2] / 2,
                    coords_max[2] + margins[2] / 2)

        ax.set_axis_off()
        ax.set_facecolor("black")

        return fig, ax

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("coords")
    parser.add_argument("animation")
    args = parser.parse_args()

    animation = Animation(
        args.coords,
        args.animation
    )

    animation.run()



if __name__ == "__main__":
    main()
