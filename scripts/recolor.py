# Turns the red brand pictures dark red (hue and brightness of the tinted parts, so the metal stays metal) and cuts the wolf out of its backdrop.
# python scripts/recolor.py   needs the originals: the Desktop emblem and the red versions from git (738d9fd).
import glob
import subprocess
import sys
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RED_HUE = 356 / 360
DARKEN = .8

# The low-poly wolf's outline on the 1024 px emblem, clockwise from the left ear tip.
WOLF = [(261, 80), (300, 125), (362, 196), (414, 196), (506, 232), (604, 196), (660, 196), (720, 130), (763, 80), (777, 180), (796, 272), (748, 352),
        (872, 520), (836, 530), (841, 662), (726, 862), (640, 868), (585, 860), (512, 942), (438, 860), (384, 868), (298, 862), (182, 660), (187, 532),
        (152, 520), (290, 357), (228, 272), (245, 170)]

def dark_red(im):
    hsv = np.array(im.convert('HSV')).astype(float)
    tinted = hsv[..., 1] > 10
    hsv[..., 0][tinted] = RED_HUE * 255
    hsv[..., 2][hsv[..., 1] > 70] *= DARKEN
    return Image.fromarray(hsv.astype('uint8'), 'HSV').convert('RGB')

def old(path):
    return Image.open(BytesIO(subprocess.check_output(['git', 'show', f'738d9fd:{path}']))).convert('RGB')

def cutout(size):
    big = Image.new('L', (size[0] * 2, size[1] * 2), 0)
    ImageDraw.Draw(big).polygon([(x * 2, y * 2) for x, y in WOLF], fill=255)
    return big.resize(size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))

if __name__ == '__main__':
    src = Image.open(glob.glob(sys.argv[1] if len(sys.argv) > 1 else r'C:/Users/Andrei PC/Desktop/03cOMV*.jpg')[0]).convert('RGB')
    emblem = dark_red(src).convert('RGBA')
    emblem.putalpha(cutout(src.size))
    emblem.crop((130, 60, 894, 960)).resize((680, 801), Image.LANCZOS).save('public/splash/emblem.webp', 'WEBP', quality=86, alpha_quality=90, method=6)
    dark_red(old('public/splash/app-bg.webp')).save('public/splash/app-bg.webp', 'WEBP', quality=76, method=6)
    dark_red(old('public/lab/hero.webp')).save('public/lab/hero.webp', 'WEBP', quality=80, method=6)
    for f in ['public/splash/emblem.webp', 'public/splash/app-bg.webp', 'public/lab/hero.webp']:
        print(f, Path(f).stat().st_size // 1024, 'KB')
