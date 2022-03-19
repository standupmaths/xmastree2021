# these are the raw coords after the scan is complete

from mpl_toolkits import mplot3d
from mpl_toolkits.mplot3d.axes3d import Axes3D
import matplotlib.pyplot as plt
import matplotlib
import math as maths


# pythagoras distance in any dimension
def dist(a, b):
    # assumes a and b are lists of the same length
    total = 0
    for i, j in zip(a, b):
        total += (i - j) ** 2
    return total ** 0.5


def find_gaps(coords):
    """
    find gap distances between all adjacent LEDs
    :param coords:
    :return gaps_sorted:
    """
    gaps = []
    scan = 0
    while scan < len(coords) - 1:
        gaps.append(dist(coords[scan], coords[scan + 1]))
        scan += 1

    gaps_sorted = [i for i in gaps]
    gaps_sorted.sort()
    return gaps, gaps_sorted


def estimate_max_dist(gaps_sorted, correct_percent, circ_avg):
    """
    find the average of the bottom percent we think are correct
    :param gaps_sorted: gaps sorted by size
    :param correct_percent: float what percentage of the lights do we think are likely correct?
    :param circ_avg: float average distance in a ball
    :return max_dist: float estimated maximum distance
    """
    scan = 0
    average_dist = 0
    while scan < len(gaps_sorted) * correct_percent:
        average_dist += gaps_sorted[scan]
        scan += 1
    average_dist /= scan
    print(average_dist)
    # scale average to match radius sphere
    max_dist = average_dist / circ_avg
    return max_dist


def discriminate_gaps(gaps, max_dist):
    """
    find all the gaps below the max_dist
    :param gaps: gaps between LEDs
    :param max_dist: max_dist as determined by estimate_max_dist
    :return track: 1 means needs fixing; 0 means no need to fix
    """
    track = []
    for i in gaps:
        if i < max_dist:
            track.append(0)
        else:
            track.append(1)
    # NOW REMOVE SINGLE OK GAPS
    scan = 1
    while scan < len(track) - 1:
        if track[scan - 1] + track[scan + 1] == 2:
            track[scan] = 1
        scan += 1
    return track


def find_correct_LEDs(track):
    correct_LEDs = [track[0]]
    # start and end don't have a pair
    scan = 0
    while scan < len(track) - 1:
        correct_LEDs.append(track[scan] * track[scan + 1])
        scan += 1
    correct_LEDs.append(track[-1])

    return correct_LEDs


def corrects_coords(track, coords, correct_LEDs):
    """
    corrects LEDs
    :param track:
    :param coords:
    :return corrected_coords:
    """
    corrected_coords = coords

    next_good = 0
    # check if the starting LEDS are wrong:
    if correct_LEDs[0] == 1:
        while correct_LEDs[next_good] == 1:
            next_good += 1
        scan = 0
        while scan < next_good:
            corrected_coords[scan] = corrected_coords[next_good]
            scan += 1

    # use finished as an escape variable
    finished = False
    while not finished:
        try:
            # move next good to end of current good run
            while correct_LEDs[next_good] == 0:
                next_good += 1
            # save that as the last good
            previous_good = next_good - 1
            # move up to next working ont
            while correct_LEDs[next_good] == 1:
                next_good += 1
        except:
            # this fails safe when we reach the end of the wire
            finished = True

        if finished:
            # check if we have a loose end of wrong LEDs make them all the same as the previous correct one
            if correct_LEDs[-1] == 1:
                # find the last one which was correct
                last_good = len(corrected_coords) - 1
                while correct_LEDs[last_good] == 1:
                    last_good -= 1
                # make the rest the same as that
                scan = last_good + 1
                while scan < len(corrected_coords):
                    corrected_coords[scan] = corrected_coords[last_good]
                    scan += 1
        else:
            # work out the difference vector
            differs = [j - i for i, j in zip(corrected_coords[previous_good], corrected_coords[next_good])]
            # split scan into scan and step which makes scaling the difference vector easier
            scan = previous_good
            step = 1
            while scan + step != next_good:
                corrected_coords[scan + step] = [int(i + j) for i, j in zip(corrected_coords[previous_good], [k * step / (next_good - previous_good) for k in differs])]
                step += 1

    return corrected_coords


def display(coords, correct_LEDs, track, scatter: bool = True, lines: bool = False):
    # Display Points
    matplotlib.use('GTK4Agg')

    # plot the points
    fig = plt.figure()
    ax = Axes3D(fig, auto_add_to_figure=False)
    fig.add_axes(ax)

    ax.set_title("Christmas Tree")
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.set_ylabel('z')
    x, y, z = zip(*coords)

    if scatter:
        ax.scatter(xs=x, ys=y, zs=z, c=['red' if value else 'green' for value in correct_LEDs])

    if lines:
        for a, b, value in zip(coords[:-1], coords[1:], track):
            ax.plot([a[0], b[0]],
                    [a[1], b[1]],
                    [a[2], b[2]], c=('red' if value else 'green'))

    plt.show()


def main(coords, correct_percent: float = 0.5, circ_avg: float = 0.75, display_result: bool = True):
    """
    :param coords:
    :param correct_percent: float what percentage of the lights do we think are likely correct?
    :param circ_avg: float average distance in a ball
    :return corrected_coords:
    """

    gaps, gaps_sorted = find_gaps(coords)
    max_dist = estimate_max_dist(gaps_sorted, correct_percent, circ_avg)
    track = discriminate_gaps(gaps, max_dist)
    correct_LEDs = find_correct_LEDs(track)
    corrected_coords = corrects_coords(track, coords, correct_LEDs)
    if display_result:
        display(corrected_coords, correct_LEDs, track, lines=True)


if __name__ == '__main__':
    coords = [[152, -93, -233], [170, -282, 228], [224, 20, 220], [224, -7, -305], [264, 48, -226], [266, -191, -579], [220, -151, -609], [223, -95, -287], [204, -29, -165], [192, -147, -307], [-142, -151, -274], [-114, -307, 174], [159, -205, -275], [-45, -251, -302], [195, -218, -233], [119, -69, -190], [125, -99, -233], [123, -203, -579], [125, -35, -133], [76, -39, -180], [71, -112, -226], [51, -106, -163], [60, 64, -47], [87, -79, -133], [82, -83, -162], [110, -175, -503], [105, -139, -169], [126, -210, -191], [115, -234, -147], [121, -229, -213], [199, 74, 590], [137, -335, -621], [124, -207, -358], [101, -261, -270], [20, -242, -295], [-338, -203, -244], [-279, -243, -475], [-335, -218, -503], [-204, -306, 437], [-41, -20, 220], [109, -340, -619], [211, -141, -303], [3, -143, -341], [157, -117, -174], [33, -122, -185], [-299, -81, -221], [-8, -31, -185], [-26, -49, -181], [-313, -72, -253], [-45, -117, -187], [-14, 17, -296], [14, -143, -195], [-13, -213, -305],
              [-335, 309, -218],
              [-26, -228, -189], [-28, -233, -253], [2, -204, -213], [-83, -229, -141], [22, -203, 65], [84, -189, -620], [-39, -139, -146], [-98, -161, -181], [-25, -129, -263], [-103, -153, -191], [-152, -209, -194], [-165, 38, -269], [-109, -125, 619], [-141, -125, -267], [-337, -210, -287], [-252, -71, -605], [-237, -271, -320], [338, 152, 320], [-130, 85, 43], [-333, -335, -503], [-257, -341, -620], [-263, -199, -205], [-203, -142, -246], [-311, 83, 502], [-152, -71, -211], [-130, -41, -169], [-111, -48, -254], [-111, -62, -183], [-112, -21, -208], [303, -50, 437], [-134, -37, -269], [122, -59, -275], [-89, 200, -253], [-167, -38, -127], [-167, -28, -228], [-236, -21, -235], [-219, -44, 170], [-246, 134, 246], [-270, -24, -252], [-239, -5, -315], [-252, -21, -245], [148, -25, 121], [-135, -42, -277], [-103, 313, 393], [-57, 26, -271], [-61, -107, -251], [-77, 94, -220], [-92, -342, 454], [-70, 39, -151], [-125, 65, -209], [-111, -42, -271], [-180, 97, -206], [-199, -143, -193],
              [-213, 103, -185], [-225, 52, -247], [-255, 95, -265], [-285, 165, -227], [-263, 171, -290], [-229, 95, -289], [-171, 129, -243], [-184, 137, -275], [-165, -186, -283], [-115, -265, -234], [-129, 133, -176], [-77, 100, -172], [-205, 117, -301], [-128, -341, -148], [-154, 163, -248], [-209, 187, -203], [-169, 127, -145], [-187, 177, -78], [-157, 113, -40], [-205, 141, -13], [-131, 121, 16], [-178, 117, 27], [-185, 219, 379], [-163, 70, -29], [-145, 85, -3], [-91, 18, -12], [-120, 109, -41], [-143, 48, -75], [-115, 109, -635], [-92, 193, -10], [-80, 19, -1], [257, 119, -545], [-76, 80, 10], [-61, 94, -98], [-95, 27, -1], [-35, 19, 47], [-70, -22, 13], [-80, 10, 0], [13, -123, -453], [-17, 104, -78], [-83, -193, 284], [-71, 131, -80], [-93, 150, -49], [-144, 108, -119], [303, 240, -173], [-91, 192, -179], [-133, 252, -181], [-101, 255, -259], [-97, 297, 449], [-50, 209, -208], [297, 211, -197], [3, 200, -149], [31, 74, 44], [111, 332, -34], [266, 263, -185], [34, 289, -214],
              [-128, 301, 618], [-129, 262, -183], [-36, 233, -209], [-23, 218, 130], [59, 165, -202], [-19, -123, -153], [3, 106, -503], [1, 85, -188], [22, -38, -585], [184, 41, -427], [25, 26, -283], [53, 30, -311], [35, 270, 241], [105, 66, -635], [143, 127, 619], [148, 146, 22], [133, 159, -316], [-7, -189, -579], [189, -305, -288], [257, 229, -328], [233, 219, -374], [273, 239, -239], [-88, 185, -122], [225, 261, -309], [186, 212, -327], [95, 209, -154], [123, 169, -305], [95, 117, -273], [133, 107, -307], [133, 92, -310], [84, 29, -571], [59, 22, -280], [65, 40, -248], [80, -14, 367], [299, -333, -621], [93, 29, -261], [125, 28, -209], [87, 5, -197], [30, 31, -259], [72, -94, 414], [110, 62, -318], [137, 77, -278], [155, 97, -265], [155, 100, -241], [159, 56, -197], [-145, 307, -351], [221, 109, -165], [257, 166, -186], [234, 74, -207], [195, 63, -157], [179, 53, -166], [145, 11, -149], [122, 25, -125], [97, -10, -59], [89, 42, -50], [61, 41, -3], [106, 50, 437], [108, 91, 5],
              [149, 98, -72], [121, 99, -25], [128, 29, 12], [-2, 1, -13], [183, -19, -86], [103, 53, -70], [126, 26, -103], [113, 79, -55], [150, 153, -99], [188, 84, 134], [154, 61, -57], [178, 60, -144], [134, 107, -170], [145, -122, 154], [233, 153, -141], [170, 157, -119], [224, 165, -64], [182, 152, -47], [233, 104, -93], [186, 160, -31], [226, 48, -17], [174, 11, -67], [225, 76, 7], [228, -8, 6], [245, 9, 61], [210, -50, 78], [181, -85, 71], [100, -104, -635], [121, 334, 619], [-110, 126, 83], [188, -334, -621], [186, 8, 142], [160, 53, 193], [109, 39, 175], [121, 90, 95], [189, 75, 81], [98, 32, 82], [73, 99, 11], [140, 102, 220], [-253, -339, -619], [15, 143, 136], [56, 112, 37], [70, 158, 84], [78, 93, 87], [131, 130, 30], [117, 152, -13], [142, 121, -23], [86, 150, -51], [138, 137, -59], [-128, 169, 619], [53, 132, -51], [45, -125, -75], [65, 343, -619], [-90, 128, -209], [79, 104, 3], [183, 32, 274], [-28, 335, -30], [-127, -142, 388], [-42, 191, 19], [-27, 156, -41],
              [-47, 221, -51], [17, 209, -87], [68, 205, 454], [5, 223, -20], [33, 243, -62], [-23, 223, -53], [-39, 229, -140], [-80, 223, -79], [-76, 187, -105], [-28, 227, -133], [-245, 80, 27], [-31, 67, -98], [-75, 158, -91], [-65, 82, -79], [110, 32, -50], [-15, 81, -155], [-33, 30, -161], [-100, 89, -264], [-45, 30, -168], [-16, 37, -99], [-133, 15, -111], [-145, 288, 416], [-143, 33, -91], [70, 309, -574], [-209, 144, -99], [-205, 135, -109], [-199, 157, -61], [-273, 69, -125], [-273, 61, -96], [137, 15, -139], [-183, -56, -63], [-141, 9, -94], [-176, -17, -92], [-143, 9, -72], [307, 16, 393], [-85, -49, -43], [-111, -19, 2], [-10, -151, 8], [121, -43, -549], [-169, -90, -19], [-187, -88, 1], [-199, -223, -13], [-268, -150, 0], [-227, -96, -1], [-227, -115, -81], [-107, -141, -93], [-161, -119, -23], [-33, 125, 619], [-96, -80, -361], [-43, -121, 9], [-61, -90, 14], [-101, -98, 83], [-12, -119, 27], [-339, -147, 90], [-67, -161, 25], [-47, -183, 25], [29, -144, -23],
              [3, -177, -78], [33, -180, -69], [45, -219, -60], [87, -218, -74], [49, -180, -57], [157, -201, -103], [75, -142, -55], [80, -179, -75], [81, -123, 634], [68, -166, 613], [64, -169, -71], [15, -133, -151], [104, -87, -59], [144, -121, -50], [167, -127, -65], [81, -63, 79], [201, -90, -67], [147, -85, -50], [189, -153, -27], [143, -128, -81], [137, -126, -42], [103, -168, -60], [136, -127, -51], [79, -104, -27], [118, -155, -1], [79, -133, 15], [-338, -151, 89], [7, 27, -147], [116, 318, -570], [-134, -39, -491], [3, 118, -478], [-47, 312, 108], [339, -74, 11], [-313, 275, -475], [-35, -73, 30], [-176, -8, -74], [331, -191, 619], [32, -115, 487], [105, -117, -635], [-15, -21, 127], [-17, -339, 155], [-17, -89, 122], [-19, -309, 393], [-96, 222, -628], [-339, -75, 143], [-156, -109, 145], [-78, -54, 174], [-137, -127, 189], [-52, -70, 177], [-105, 83, 245], [-43, -111, 199], [-19, -82, 199], [121, -86, 247], [59, -93, 188], [41, -141, 191], [123, -135, 619],
              [-122, -188, -302],
              [28, -251, -427], [107, -109, 119], [97, -151, 107], [121, -93, 91], [175, -165, 169], [112, 65, 266], [63, -104, 201], [26, -103, 248], [2, 41, 235], [35, -37, 291], [-1, -86, 337], [74, -67, 377], [74, -87, 377], [50, -39, 391], [59, -58, 333], [-21, -101, 455], [-39, -79, 414], [-1, -89, 455], [-45, 254, 509], [27, -37, 434], [7, -22, 460], [19, -55, 535], [-22, -11, 539], [2, -28, 478], [-24, 5, 489], [0, -38, 419], [-62, -8, 414], [-57, -23, 382], [-57, -89, 375], [-93, -98, 367], [-78, -76, 279], [-77, -25, 279], [-108, -65, 282], [-166, -103, 235], [-106, -37, 219], [-73, -33, -200], [-115, -60, 234], [-124, -23, 244], [111, 175, -94], [-151, -57, 165], [-139, 110, 125], [-199, -23, 95], [-152, 27, 123], [-197, 61, 67], [-126, -335, 129], [-171, 127, 123], [-110, 82, 127], [-33, 105, 105], [-129, 39, 168], [-86, -123, 619], [-87, 184, -58], [-75, 91, 167], [-109, 50, 249], [335, 337, 223], [-75, 71, 253], [-23, 67, 305], [11, 37, 349], [-59, 24, 358],
              [21, 31, 390],
              [-3, 1, 451], [36, 61, 437], [24, -3, 460], [68, 5, 448], [54, -30, 392], [39, -22, 339], [62, 34, 373], [113, 23, -175], [-25, 51, 327], [28, 70, 297], [252, 67, -521], [-337, 43, 225], [-23, 71, 232], [305, 67, 224], [8, 78, 161], [-42, 115, 190], [-65, 149, -440], [-19, 184, 201], [32, 199, 186], [68, 157, 109], [97, 158, 121], [80, 157, 129], [130, 165, 211], [107, 141, 211], [58, 100, 211], [29, 69, 238], [-128, 67, 619], [75, 37, 193], [261, -26, 555], [-3, 336, 222], [86, 125, 619], [46, 42, 165], [83, 16, 233], [146, 1, -622], [169, 41, 124], [165, -27, 123], [150, 2, 139], [151, -67, 181], [184, -89, 362], [-155, -15, 215], [-231, -58, -93], [77, 3, 195], [85, 2, 233], [33, -21, 283], [95, -61, 301], [32, 23, 259]]

    main(coords, display_result=True)

# Now need to convert to GIFT
