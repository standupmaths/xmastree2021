# xmastree2021
Code and coordinates for Matt's 2021 xmas tree

This repository contains the code and coordinates used for Matt's 2021 Christmas tree, as featured in ["My 500-LED xmas tree got into Harvard."](https://youtu.be/WuMRJf6B5Q4).

`coords_2021.csv` are the coordinates of Matt's 2021 tree in GIFT format.

⚠️ The first few entries are identical because they were scanned incorrectly and so were set to the same value as the first 'correct' LED.

`light_fixer.py` is the original source code from the video. It corrects coordinates in 'pixel space' but does not convert to GIFT.

Code in the `examples` folder has been provided by other contributors!

Most of what you need is probably over on the Harvard Graduate School of Design repository: ["GSD-6338: Introduction to Computational Design"](https://github.com/GSD6338)

## Usage


## Contributing

You're welcome to contribute! There are a few different places that your PR could target:

- Small bug fixes, as well as small changes that significantly increase usability, will be accepted directly in to the original code.

- The `examples` folder has been created as a place for any effects contained within a single CSV file. Files should be named based on the effect - `fire.csv` for example.

- If you've done a bigger bit of work, consider keeping this in your own repository, and opening a PR to update the Further Work section below.

## Further Work

Links to larger projects based on this one

- ["MPTree - Matt Parker's Tree Emulator"](https://santiagodg.github.io/mptree/): Load your local GIFT files and CSV light sequences directly on your browser! Useful for quick testing.
- [Xmas Tree Lights Live Coding App](https://github.com/sirxemic/xmastree-app): Code the xmas lights directly in the browser and see immediate results. Available online [here](https://sirxemic.github.io/xmastree-app/).
- [Christmas Tree Visualizer](https://github.com/Aonodensetsu/xmas-tree-visualizer): Preview PY or CSV with a single click, create effects in a very simple way. Close to no setup required.
