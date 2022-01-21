#Animation File Format

The animation files are CSV (comma separated value) spreadsheet files.

The first row contains the column names which are used to identify the contents of the column.
Every subsequent row contains the data for each frame.

The header names are:

`FRAME_ID` - This stores the index of the frame.
This column should contain integers.
Lowest values will be displayed first.
This column is optional. If undefined the frames will be displayed in the order they are in the CSV file. 

`FRAME_TIME` - The amount of time the frame will remain for in milliseconds.
This should contain ints or floats eg a value of 33.33 is 33.33ms or 1/30th of a second.
This column is optional. If undefined will default to 0 and will run as fast as the hardware will allow.

`[RGB]_[0-9]+` - The intensity of each colour channel for the given LED index.
Examples are `R_0`, `G_0` and `B_0` which are the red, green and blue channel for LED 0.
The values of these columns should be floats or ints between 0 and 255 inclusive.
