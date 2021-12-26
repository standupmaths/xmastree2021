#!/usr/bin/env python3
"""Animates a baked animation CSV on top of the tree LED coordinates

Usage: ./visualization/visualize.py coords_2021.csv examples/test.csv
"""

from matplotlib import pyplot as plt
from matplotlib.animation import FuncAnimation
import argparse
import numpy as np

class Animation:
    def __init__(self, coords_path:str, animation_path:str, interval=33, verbose=True):
        """Animation class that can show an animation csv on GIFT coordinates

        Args:
            coords_path (str): The path to the LED coordinates on the tree
            animation_path (str): path tho
            interval (int, optional): The update interval / how much the animation sleeps between frames [ms]. Defaults to 10.

        Raises:
            ValueError: If the animation and coordinate sizes don't match
        """
        # Load data from files
        coords = self.load_csv(coords_path)
        self.frames = self.load_csv(animation_path, header=True) / 255

        # Check that sizes match
        n_coords = coords.shape[0]
        n_animation_coords = (self.frames.shape[1] - 1) / 3
        if n_coords != n_animation_coords:
            raise ValueError(f"Number of LED's on tree ({n_coords}) does not match number of LED's in animation ({n_animation_coords})")

        # Store number of frames for display
        self.n_frames = len(self.frames)
        self.verbose = verbose

        # Create subplot
        self.fig, self.ax = self.create_scaled_axis(coords)
        self.data = self.ax.scatter(coords[:, 0], coords[:, 1], coords[:, 2])

        # Interval for animation
        self.interval = interval

    def run(self):
        """Starts animation
        """
        ani = FuncAnimation(self.fig, self._update, frames=range(len(self.frames)), blit=True, interval=self.interval)
        plt.show()

    def _update(self, frame_idx):
        """Updates animation

        Args:
            frame_idx (int): The index of the frame to be drawn

        Returns:
            list: The updated data uses by the matplotlib animation
        """
        # Print frame info if verbose
        if self.verbose:
            print(f"Frame {frame_idx:03} / {self.n_frames:03}", end="\r")

        # Get frame data
        frame = self.frames[frame_idx][1:]
        frame = frame.reshape(-1, 3)

        # Update colors
        self.data.set_color(frame)
        return [self.data]

    @staticmethod
    def load_csv(path, header=False):
        """Loads csv from a given path as numpy array. I couldn't use `np.loadtxt`, due to some weird unicode character in the coords file.

        Args:
            path (str): The path to the np array
            header (bool, optional): Wether there is a header that should be ignored. Defaults to False.

        Returns:
            np.array: A numpy array holding the parsed data
        """
        with open(path) as f:
            if header:
                f.readline()
            coords_raw = f.read().replace("\ufeff", "").strip()

        return np.array([[float(c) for c in row.split(",")] for row in coords_raw.split("\n")])

    @staticmethod
    def create_scaled_axis(coords):
        """Creates matplotlib axis that is scaled correctly as not to distort the tree.

        Args:
            coords (np.array): The coordinates of the tree

        Returns:
            (fig, ax): The figure and axis that were created
        """
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

        # Cosmetics
        ax.set_axis_off()
        ax.set_facecolor((0.1, 0.1, 0.1))

        return fig, ax

def main():
    """Pareses arguments and runs animation
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("coords", help="The path to the coordinates csv")
    parser.add_argument("animation", help="The path to the animation csv")
    parser.add_argument("-i", '--interval', default=33, type=int, help="The animation interval in ms")
    args = parser.parse_args()

    animation = Animation(
        args.coords,
        args.animation,
        interval=args.interval
    )

    animation.run()



if __name__ == "__main__":
    main()
