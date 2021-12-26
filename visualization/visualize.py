#!/usr/bin/env python3

from matplotlib import pyplot as plt
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("coords")
    parser.add_argument("animation")
    args = parser.parse_args()    
