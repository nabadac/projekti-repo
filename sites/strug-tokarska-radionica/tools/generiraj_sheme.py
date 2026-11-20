#!/usr/bin/env python3
"""Generira tehničke sheme (SVG) za koncept stranice STRUG.

Pokretanje:  python3 tools/generiraj_sheme.py
Izlaz:       assets/img/sheme/*.svg
"""
import math, os, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img', 'sheme')
INK, OR, PAPER, GREY = '#141414', '#ff4a1c', '#ecebe4', '#8d8a82'

STYLE = f"""<style>
.o{{stroke-width:2.2}} .m{{stroke-width:1.4}} .th{{stroke-width:.7}}
.c{{stroke-width:.7;stroke-dasharray:16 4 2 4}} .hid{{stroke-width:.9;stroke-dasharray:6 4}}
.ph{{stroke-width:.9;stroke-dasharray:18 4 2 4 2 4}}
.d{{stroke-width:.7}} .or{{stroke:{OR}}} .orf{{fill:{OR};stroke:none}} .inkf{{fill:{INK};stroke:none}}
.pf{{fill:{PAPER}}}
text{{fill:{INK};stroke:none;font-size:13px;letter-spacing:.04em}}
.ts{{font-size:10.5px}} .tl{{font-size:16px}} .tb{{font-weight:700}} .to{{fill:{OR}}} .tw{{fill:{PAPER}}}
</style>"""

DEFS = f"""<defs>
<pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="{INK}" stroke-width=".8"/></pattern>
<pattern id="hd" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3.6" stroke="{INK}" stroke-width=".7"/></pattern>
<pattern id="hx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="7" stroke="{INK}" stroke-width=".8"/></pattern>
<pattern id="dt" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".75" fill="{INK}"/><circle cx="3.7" cy="3.7" r=".55" fill="{INK}"/></pattern>
<pattern id="dtl" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".6" fill="{INK}"/></pattern>
<pattern id="ho" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="{OR}" stroke-width="1"/></pattern>
<marker id="a" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 1.6 10 5 0 8.4Z" fill="{INK}"/></marker>
<marker id="ao" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 1.6 10 5 0 8.4Z" fill="{OR}"/></marker>
</defs>"""


def svg(name, w, h, body, title):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
         f'role="img" aria-label="{title}" fill="none" stroke="{INK}" stroke-width="1.1" '
         f'stroke-linejoin="round" stroke-linecap="round" '
         f'font-family="\'IBM Plex Mono\',\'DejaVu Sans Mono\',monospace">'
         f'<title>{title}</title>{STYLE}{DEFS}{body}</svg>\n')
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(s)
    print('  ', name, f'{len(s)/1024:.1f} kB')


f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')


def L(x1, y1, x2, y2, c=''):
    return f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}"{cls(c)}/>'


def cls(c):
    return f' class="{c}"' if c else ''


def R(x, y, w, h, c='', extra=''):
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"{cls(c)} {extra}/>'


def C(x, y, r, c='', extra=''):
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"{cls(c)} {extra}/>'


def E(x, y, rx, ry, c='', extra=''):
    return f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rx)}" ry="{f(ry)}"{cls(c)} {extra}/>'


def P(pts, c='', close=True, extra=''):
    d = 'M' + ' '.join(f'{f(x)} {f(y)}' for x, y in pts) + (' Z' if close else '')
    return f'<path d="{d}"{cls(c)} {extra}/>'


def T(x, y, s, c='', anchor='start', rot=None, extra=''):
    tr = f' transform="rotate({rot} {f(x)} {f(y)})"' if rot is not None else ''
    return f'<text x="{f(x)}" y="{f(y)}" text-anchor="{anchor}"{cls(c)}{tr} {extra}>{s}</text>'


def dimh(x1, x2, y, txt, frm=None, c='ts', above=True):
    """Horizontalna kota. frm = y s kojeg kreću pomoćne linije (ili (y1,y2))."""
    s = ''
    if frm is not None:
        a, b = frm if isinstance(frm, tuple) else (frm, frm)
        for x, fy in ((x1, a), (x2, b)):
            d = 1 if y > fy else -1
            s += L(x, fy + 4 * d, x, y + 6 * d, 'd')
    s += f'<path d="M{f(x1)} {f(y)}H{f(x2)}" class="d" marker-start="url(#a)" marker-end="url(#a)"/>'
    s += T((x1 + x2) / 2, y - 5 if above else y + 14, txt, c, 'middle')
    return s


def dimv(y1, y2, x, txt, frm=None, c='ts'):
    s = ''
    if frm is not None:
        a, b = frm if isinstance(frm, tuple) else (frm, frm)
        for y, fx in ((y1, a), (y2, b)):
            d = 1 if x > fx else -1
            s += L(fx + 4 * d, y, x + 6 * d, y, 'd')
    s += f'<path d="M{f(x)} {f(y1)}V{f(y2)}" class="d" marker-start="url(#a)" marker-end="url(#a)"/>'
    s += T(x - 5, (y1 + y2) / 2, txt, c, 'middle', rot=-90)
    return s


def balloon(n, x, y, tx, ty, r=13, orange=False):
    s = L(tx, ty, x, y, 'd') + C(tx, ty, 2.2, 'inkf')
    s += C(x, y, r, 'm', f'fill="{OR if orange else PAPER}"' + (' stroke="none"' if orange else ''))
    s += T(x, y + 4.5, str(n), 'tb' + (' tw' if orange else ''), 'middle')
    return s


def ra(x, y, val, rot=0):
    """Simbol hrapavosti površine."""
    g = (f'<g transform="translate({f(x)} {f(y)}) rotate({rot})">'
         f'<path d="M-9 -9 0 0 16 -26H44" class="th"/>' + T(18, -30, f'Ra {val}', 'ts') + '</g>')
    return g


# ------------------------------------------------------------------ 1. HERO — CNC TOKARILICA
def hero():
    b = ''
    # tlo
    b += L(80, 690, 1520, 690, 'm')
    for x in range(90, 1520, 14):
        b += L(x, 690, x - 10, 701, 'th')
    # zaštitna kabina (fantomska linija)
    b += P([(190, 500), (190, 160), (230, 128), (1410, 128), (1440, 160), (1440, 500)], 'ph', close=False)
    b += T(205, 150, 'ZAŠTITNA KABINA — PRIKAZ BEZ VRATA', 'ts')
    # postolje
    b += R(232, 500, 288, 180, 'm', f'fill="url(#dt)"') + R(232, 500, 288, 180, 'm')
    b += R(1150, 500, 250, 180, 'm', f'fill="url(#dt)"') + R(1150, 500, 250, 180, 'm')
    b += R(252, 520, 248, 140, 'th', f'fill="{PAPER}"') + R(1170, 520, 210, 140, 'th', f'fill="{PAPER}"')
    for x in (282, 470, 1200, 1350):
        b += C(x, 540, 4, 'th')
    b += T(376, 596, 'HIDRAULIČKI AGREGAT', 'ts', 'middle') + T(1275, 596, 'TRANSPORTER STRUGOTINE', 'ts', 'middle')
    for x in (232, 490, 1150, 1370):
        b += R(x, 680, 30, 10, 'th', f'fill="{INK}"')
    # posuda za strugotinu
    b += P([(520, 560), (540, 640), (1130, 640), (1150, 560)], 'm', extra=f'fill="url(#dtl)"')
    b += P([(520, 560), (540, 640), (1130, 640), (1150, 560)], 'm')
    rnd = random.Random(4)
    for _ in range(46):
        x, y = rnd.uniform(560, 1110), rnd.uniform(585, 632)
        r = rnd.uniform(3, 7)
        b += f'<path d="M{f(x)} {f(y)}a{f(r)} {f(r)} 0 1 1 {f(r*1.4)} {f(r*.4)}" class="th"/>'
    # krevet / vodilice
    b += R(210, 470, 1210, 30, 'o', f'fill="{PAPER}"')
    b += R(540, 462, 860, 8, 'm', f'fill="{PAPER}"')
    b += L(210, 485, 1420, 485, 'th')
    for x in range(230, 1420, 40):
        b += L(x, 485, x, 500, 'th')
    # glavno vreteno — kućište
    b += P([(210, 470), (210, 230), (236, 204), (500, 204), (500, 470)], 'o', extra=f'fill="{PAPER}"')
    b += R(232, 228, 246, 222, 'th')
    b += R(470, 228, 30, 242, 'th', 'fill="url(#h)"')
    for y in range(262, 352, 8):
        b += L(252, y, 330, y, 'm')
    b += T(252, 254, 'VRETENO S1 · 22 kW', 'ts')
    b += R(350, 380, 100, 50, 'th') + T(400, 409, '4500 min⁻¹', 'ts', 'middle')
    for x in (370, 400, 430):
        b += C(x, 300, 9, 'th') + C(x, 300, 2, 'inkf')
    b += R(500, 270, 20, 120, 'm', f'fill="{PAPER}"')
    # stezna glava
    b += P([(520, 240), (530, 230), (592, 230), (600, 240), (600, 420), (592, 430), (530, 430), (520, 420)], 'o', extra=f'fill="{PAPER}"')
    b += L(540, 232, 540, 428, 'th') + L(580, 232, 580, 428, 'th')
    b += R(540, 232, 40, 196, 'th', 'fill="url(#hd)"')
    b += P([(600, 248), (622, 248), (622, 268), (632, 268), (632, 286), (600, 286)], 'm', extra=f'fill="{PAPER}"')
    b += P([(600, 412), (622, 412), (622, 392), (632, 392), (632, 374), (600, 374)], 'm', extra=f'fill="{PAPER}"')
    # sirovac (fantom)
    b += P([(915, 284), (1130, 284), (1130, 376), (915, 376)], 'hid', close=False)
    b += T(1020, 278, 'SIROVAC Ø92', 'ts', 'middle')
    # obradak
    segs = [(632, 800, 42, 'Ø84 h6'), (800, 930, 34, 'Ø68'), (930, 1030, 28, 'M56×2'), (1030, 1130, 22, 'Ø44')]
    for x1, x2, r, lab in segs:
        b += R(x1, 330 - r, x2 - x1, 2 * r, 'o', f'fill="{PAPER}"')
        if lab.startswith('M'):
            for x in range(int(x1) + 6, int(x2) - 2, 7):
                b += L(x, 330 - r + 1, x + 4, 330 + r - 1, 'th')
            b += L(x1, 330 - r + 4, x2, 330 - r + 4, 'th') + L(x1, 330 + r - 4, x2, 330 + r - 4, 'th')
        else:
            # cilindrično sjenčanje
            for k in range(1, 7):
                yy = 330 + r * math.sin(math.radians(30 + k * 9))
                b += L(x1 + 4, yy, x2 - 4, yy, 'th')
            b += T((x1 + x2) / 2, 326, lab, 'ts', 'middle')
    b += R(1124, 323, 6, 14, 'th', f'fill="{INK}"')
    # konjić
    b += P([(1130, 330), (1158, 316), (1158, 344)], 'm', extra=f'fill="{PAPER}"')
    b += R(1158, 312, 72, 36, 'm', f'fill="{PAPER}"')
    for x in range(1170, 1226, 10):
        b += L(x, 312, x, 348, 'th')
    b += P([(1230, 470), (1230, 270), (1262, 246), (1350, 246), (1380, 270), (1380, 470)], 'o', extra=f'fill="{PAPER}"')
    b += R(1230, 420, 150, 50, 'th', 'fill="url(#h)"')
    b += L(1245, 290, 1365, 290, 'th') + T(1305, 380, 'KONJIĆ', 'ts', 'middle')
    b += R(1380, 318, 18, 24, 'm', f'fill="{PAPER}"') + L(1398, 330, 1430, 330, 'm') + C(1432, 330, 4, 'm')
    # suport + revolver
    b += R(830, 432, 240, 30, 'o', f'fill="{PAPER}"')
    b += R(860, 410, 180, 22, 'm', f'fill="{PAPER}"')
    b += P([(880, 410), (880, 392), (896, 384), (1000, 384), (1016, 392), (1016, 410)], 'm', extra=f'fill="{PAPER}"')
    for x in range(900, 1000, 14):
        b += L(x, 388, x, 408, 'th')
    b += R(902, 376, 30, 10, 'm', f'fill="{PAPER}"')
    b += P([(905, 376), (930, 376), (916, 365)], '', extra=f'fill="{OR}" stroke="{INK}" stroke-width="1"')
    # strugotina
    b += '<path d="M921 366c8-2 16 3 14 10s-11 6-11 0 7-7 12-3 5 12-1 15" class="m or"/>'
    b += '<path d="M940 380c6 0 9 6 6 10s-9 1-7-3 8-3 9 3-2 9-6 9" class="th or"/>'
    # SHIP — crijevo
    b += '<path d="M1060 128v50c0 30-40 40-70 60s-50 50-56 104" class="th"/>'
    for t in range(0, 11):
        u = t / 10
        x = (1 - u) ** 3 * 1060 + 3 * (1 - u) ** 2 * u * 1060 + 3 * (1 - u) * u ** 2 * 990 + u ** 3 * 934
        y = (1 - u) ** 3 * 178 + 3 * (1 - u) ** 2 * u * 208 + 3 * (1 - u) * u ** 2 * 238 + u ** 3 * 342
        b += C(x, y, 5, 'th', f'fill="{PAPER}"')
    for dx in (-6, 0, 6):
        b += L(932, 346, 922 + dx, 362, 'th or')
    # upravljačka jedinica
    b += L(1440, 160, 1470, 160, 'm') + L(1470, 160, 1470, 180, 'm')
    b += R(1450, 180, 90, 230, 'o', f'fill="{PAPER}"')
    b += R(1460, 192, 70, 58, 'm', 'fill="url(#hd)"')
    b += R(1466, 198, 58, 46, 'th', f'fill="{PAPER}"')
    for i, w in enumerate((40, 30, 46, 22, 34)):
        b += L(1471, 206 + i * 8, 1471 + w, 206 + i * 8, 'th')
    for r_ in range(4):
        for c_ in range(4):
            b += R(1462 + c_ * 17, 262 + r_ * 17, 12, 12, 'th')
    b += C(1495, 352, 16, 'm') + C(1495, 352, 6, 'th') + C(1470, 392, 7, 'o', f'fill="{OR}"')
    # os
    b += L(170, 330, 1446, 330, 'c')
    # kote
    b += dimh(632, 1130, 168, '500', frm=(288, 308))
    xs = [632, 800, 930, 1030, 1130]
    lab = ['170', '130', '100', '100']
    for i in range(4):
        b += dimh(xs[i], xs[i + 1], 196, lab[i], frm=(None if i else None))
    for x, top in zip(xs, [288, 288, 296, 302, 308]):
        b += L(x, top - 4, x, 190, 'd')
    b += ra(842, 296, '0,8')
    # pozicije
    pts = [(1, 300, 70, 360, 220), (2, 470, 70, 560, 236), (3, 700, 92, 716, 292), (4, 960, 70, 962, 396),
           (5, 1290, 70, 1300, 258), (6, 1495, 70, 1495, 182), (7, 1110, 92, 1056, 168)]
    for n, x, y, tx, ty in pts:
        b += balloon(n, x, y, tx, ty, orange=(n == 3))
    # natpisno polje
    b += R(1290, 708, 230, 40, 'm') + L(1390, 708, 1390, 748, 'th')
    b += T(1300, 724, 'STRUG', 'ts tb') + T(1300, 740, 'SL. 01', 'ts')
    b += T(1400, 724, 'CNC TOKARILICA', 'ts') + T(1400, 740, 'BOČNI POGLED 1:20', 'ts')
    svg('01-cnc-tokarilica.svg', 1600, 760, b, 'Shema CNC tokarilice: vreteno, stezna glava, obradak, revolverska glava, konjić')


# ------------------------------------------------------------------ helpers for vertical cylinders
K = 0.32


def vcyl_stack(cx, segs, k=K, shade=True, extra_top=None):
    """segs: lista (r, y_top, y_bot) odozgo prema dolje. Crta odozdo prema gore."""
    b = ''
    for i in range(len(segs) - 1, -1, -1):
        r, yt, yb = segs[i]
        b += (f'<path d="M{f(cx-r)} {f(yt)}V{f(yb)}A{f(r)} {f(r*k)} 0 0 0 {f(cx+r)} {f(yb)}V{f(yt)}Z" '
              f'class="o" fill="{PAPER}"/>')
        if shade:
            angs = [12, 24, 34, 43, 51, 58, 64, 69, 73.5, 77.5, 81, 84, 86.5, 88.5]
            for a in angs:
                x = cx + r * math.sin(math.radians(a))
                dy = r * k * math.cos(math.radians(a))
                b += L(x, yt + dy + 1, x, yb + dy - 1, 'th')
            for a in (-62, -74):
                x = cx + r * math.sin(math.radians(a))
                dy = r * k * math.cos(math.radians(a))
                b += L(x, yt + dy + 1, x, yb + dy - 1, 'th')
        b += E(cx, yt, r, r * k, 'o', f'fill="{PAPER}"')
        if extra_top and i in extra_top:
            b += extra_top[i]
    return b


# ------------------------------------------------------------------ 2. VRATILO S NARANČASTIM KRUGOM
def vratilo():
    cx = 300
    b = C(455, 250, 168, 'orf')
    # tlo
    b += L(40, 772, 660, 772, 'm')
    for x in range(48, 660, 12):
        b += L(x, 772, x - 9, 782, 'th')
    b += E(cx + 30, 768, 120, 22, 'th', 'fill="url(#hd)"')
    segs = [(36, 70, 210), (56, 210, 380), (98, 380, 430), (72, 430, 640), (58, 640, 760)]
    b += vcyl_stack(cx, segs)
    # navoj
    for y in range(78, 206, 8):
        b += f'<path d="M{cx-36} {y}A36 {36*K:.1f} 0 0 0 {cx+36} {y+5}" class="th"/>'
    b += E(cx, 70, 9, 9 * K, 'inkf')
    # rupe na prirubnici
    for a in range(0, 360, 45):
        x = cx + 80 * math.cos(math.radians(a))
        y = 380 + 80 * K * math.sin(math.radians(a))
        b += E(x, y, 8, 8 * K, 'm', f'fill="{INK}"')
    # ponovno nacrtaj stupanj 56 preko rupa iza
    b += (f'<path d="M{cx-56} 210V380A56 {56*K:.1f} 0 0 0 {cx+56} 380V210Z" class="o" fill="{PAPER}"/>')
    for a in [12, 24, 34, 43, 51, 58, 64, 69, 73.5, 77.5, 81, 84, 86.5, 88.5, -62, -74]:
        x = cx + 56 * math.sin(math.radians(a)); dy = 56 * K * math.cos(math.radians(a))
        b += L(x, 210 + dy + 1, x, 380 + dy - 1, 'th')
    b += E(cx, 210, 56, 56 * K, 'o', f'fill="{PAPER}"')
    b += (f'<path d="M{cx-36} 70V210A36 {36*K:.1f} 0 0 0 {cx+36} 210V70Z" class="o" fill="{PAPER}"/>')
    for y in range(78, 206, 8):
        b += f'<path d="M{cx-36} {y}A36 {36*K:.1f} 0 0 0 {cx+36} {y+5}" class="th"/>'
    b += E(cx, 70, 36, 36 * K, 'o', f'fill="{PAPER}"') + E(cx, 70, 9, 9 * K, 'inkf')
    # utor za klin
    b += R(cx - 14, 470, 28, 130, 'm', f'rx="14" fill="{PAPER}"') + R(cx - 8, 478, 16, 114, 'th', 'rx="8" fill="url(#hd)"')
    # os
    b += L(cx, 40, cx, 790, 'c')
    # oznake
    labs = [(140, 'M72×2'), (300, 'Ø112 k6'), (405, 'Ø196'), (540, 'Ø144 h6'), (700, 'Ø116')]
    rr = {140: 36, 300: 56, 405: 98, 540: 72, 700: 58}
    for y, t in labs:
        x0 = cx - rr[y]
        b += L(x0 - 4, y, 90, y, 'd') + C(x0, y, 2, 'inkf') + T(84, y + 4, t, 'ts', 'end')
    b += dimv(70, 760, 580, '690', frm=(cx + 40, cx + 64))
    b += ra(cx + 72, 560, '0,4', 0)
    b += T(470, 470, 'POZ. 03 · VRATILO', 'ts tb') + T(470, 486, '42CrMo4 · KALJENO', 'ts')
    svg('02-vratilo.svg', 700, 800, b, 'Stupnjevano vratilo s navojem i utorom za klin, aksonometrijski prikaz')


# ------------------------------------------------------------------ 3. IKONE USLUGA (izometrija)
def iso(ox, oy, s=1):
    c30, s30 = math.cos(math.radians(30)), .5
    return lambda x, y, z: (ox + (x - y) * c30 * s, oy + (x + y) * s30 * s - z * s)


def ikone():
    W, H = 260, 220
    # 01 tokarenje
    b = ''
    segs = [(20, 30, 70), (34, 70, 120), (48, 120, 150), (30, 150, 190)]
    b += E(130, 196, 70, 18, 'th', 'fill="url(#hd)"')
    b += vcyl_stack(130, segs, k=.42)
    for y in range(36, 68, 6):
        b += f'<path d="M110 {y}A20 8.4 0 0 0 150 {y+3}" class="th"/>'
    b += P([(185, 98), (214, 92), (214, 106)], '', extra=f'fill="{OR}" stroke="{INK}"')
    b += R(214, 90, 40, 18, 'm', f'fill="{PAPER}"')
    b += '<path d="M66 40a64 22 0 0 1 128 0" class="m" marker-end="url(#a)"/>'
    b += T(60, 30, 'n', 'ts', 'end')
    svg('ikona-tokarenje.svg', W, H, b, 'Ikona: tokarenje')
    # 02 brušenje
    b = E(118, 192, 92, 22, 'th', 'fill="url(#hd)"')
    k = .42
    b += f'<path d="M30 112V140A88 {88*k:.1f} 0 0 0 206 140V112Z" class="o" fill="url(#dt)"/>'
    b += f'<path d="M30 112V140A88 {88*k:.1f} 0 0 0 206 140V112Z" class="o"/>'
    b += E(118, 112, 88, 88 * k, 'o', f'fill="{PAPER}"') + E(118, 112, 70, 70 * k, 'th')
    b += E(118, 112, 30, 30 * k, 'm', f'fill="{PAPER}"') + E(118, 112, 12, 12 * k, 'inkf')
    b += vcyl_stack(214, [(16, 40, 200)], k=k)
    for a in (-10, 10, 28, 46):
        ang = math.radians(a)
        b += L(204 + 12 * math.cos(ang), 150 + 12 * math.sin(ang), 204 + 44 * math.cos(ang), 150 + 44 * math.sin(ang), 'm or')
    b += '<path d="M68 76a50 18 0 0 1 100 0" class="m" marker-end="url(#a)"/>'
    svg('ikona-brusenje.svg', W, H, b, 'Ikona: brušenje')
    # 03 glodanje
    p = iso(130, 92, 1)
    A, B_, Hh = 110, 70, 46
    top = [p(-A/2, -B_/2, 0), p(A/2, -B_/2, 0), p(A/2, B_/2, 0), p(-A/2, B_/2, 0)]
    bot = [p(*q, -Hh) for q in [(A/2, -B_/2), (A/2, B_/2), (-A/2, B_/2)]]
    b = P([top[1], bot[0], bot[1], top[2]], 'o', extra=f'fill="url(#h)"')
    b += P([top[1], bot[0], bot[1], top[2]], 'o')
    b += P([top[2], bot[1], bot[2], top[3]], 'o', extra=f'fill="{PAPER}"')
    b += P(top, 'o', extra=f'fill="{PAPER}"')
    pk = [p(-25, -15, 0), p(25, -15, 0), p(25, 15, 0), p(-25, 15, 0)]
    pd = [p(-25, -15, -16), p(25, -15, -16), p(25, 15, -16), p(-25, 15, -16)]
    b += P(pk, 'm', extra='fill="url(#hd)"') + P([pk[0], pd[0], pd[1], pk[1]], 'th', extra=f'fill="{PAPER}"')
    b += P([pk[3], pd[3], pd[0], pk[0]], 'th', extra=f'fill="{PAPER}"') + P([pd[0], pd[1], pd[2], pd[3]], 'm', extra=f'fill="{PAPER}"')
    cxm, cym = p(10, 0, -16)
    b += vcyl_stack(cxm, [(14, 18, 54), (9, 54, cym)], k=.577, shade=False)
    for y in range(58, int(cym) - 4, 7):
        b += L(cxm - 9, y, cxm + 9, y + 6, 'th')
    b += f'<path d="M{f(cxm-30)} 30a30 10 0 0 1 60 0" class="m" marker-end="url(#a)"/>'
    b += P([p(A/2+8, -B_/2, 0), p(A/2+40, -B_/2, 0)], 'm or', close=False, extra='marker-end="url(#ao)"')
    svg('ikona-glodanje.svg', W, H, b, 'Ikona: glodanje')
    # 04 navoji — vijak
    b = E(130, 200, 40, 12, 'th', 'fill="url(#hd)"')
    b += vcyl_stack(130, [(24, 96, 196)], k=.5, shade=False)
    for y in range(102, 194, 7):
        b += f'<path d="M106 {y}A24 12 0 0 0 154 {y+4}" class="th"/>'
    Rh, h_, k2 = 52, 34, .5
    hx = [(130 + Rh * math.cos(math.radians(a)), 62 + Rh * k2 * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    for i in range(6):
        a1, a2 = i * 60, (i + 1) * 60
        mid = math.radians((a1 + a2) / 2)
        if math.sin(mid) > 0:
            q1, q2 = hx[i], hx[(i + 1) % 6]
            fill = 'url(#h)' if math.cos(mid) > .3 else PAPER
            b += P([q1, q2, (q2[0], q2[1] + h_), (q1[0], q1[1] + h_)], 'o', extra=f'fill="{fill}"')
            b += P([q1, q2, (q2[0], q2[1] + h_), (q1[0], q1[1] + h_)], 'o')
    b += P(hx, 'o', extra=f'fill="{PAPER}"') + E(130, 62, 40, 20, 'th')
    b += P([(116, 55), (144, 55), (144, 69), (116, 69)], 'm', extra=f'fill="{OR}" stroke="none"')
    b += T(196, 160, 'M24', 'ts') + L(156, 156, 192, 156, 'd')
    svg('ikona-navoji.svg', W, H, b, 'Ikona: navoji')


# ------------------------------------------------------------------ 4. RADIONIČKI CRTEŽ — PRIRUBNICA
def prirubnica():
    W = H = 1000
    b = R(10, 10, 980, 980, 'm') + R(34, 34, 932, 932, 'o')
    for i, l in enumerate('ABCD'):
        y = 34 + 932 / 8 * (2 * i + 1)
        b += T(22, y + 4, l, 'ts', 'middle') + T(978, y + 4, l, 'ts', 'middle')
        b += L(10, 34 + 932 / 4 * i, 34, 34 + 932 / 4 * i, 'th')
    for i in range(4):
        x = 34 + 932 / 8 * (2 * i + 1)
        b += T(x, 26, str(i + 1), 'ts', 'middle') + T(x, 982, str(i + 1), 'ts', 'middle')
        b += L(34 + 932 / 4 * i, 10, 34 + 932 / 4 * i, 34, 'th')
    cx, cy = 300, 390
    # nacrt
    b += C(cx, cy, 200, 'o', f'fill="{PAPER}"') + C(cx, cy, 194, 'th')
    b += C(cx, cy, 95, 'm') + C(cx, cy, 150, 'c')
    b += P([(cx - 14, cy - 49), (cx - 14, cy - 62), (cx + 14, cy - 62), (cx + 14, cy - 49)], 'o', close=False)
    b += f'<path d="M{cx-14} {cy-48}A50 50 0 1 0 {cx+14} {cy-48}" class="o"/>'
    for a in range(0, 360, 45):
        hx, hy = cx + 150 * math.cos(math.radians(a + 22.5)), cy + 150 * math.sin(math.radians(a + 22.5))
        b += C(hx, hy, 16, 'o', f'fill="{PAPER}"')
        t = math.radians(a + 22.5)
        b += L(hx - 22 * math.cos(t), hy - 22 * math.sin(t), hx + 22 * math.cos(t), hy + 22 * math.sin(t), 'c')
    b += L(cx - 225, cy, cx + 225, cy, 'c') + L(cx, cy - 225, cx, cy + 225, 'c')
    # presjek A–A
    for y, d in ((cy - 238, 1), (cy + 238, -1)):
        b += L(cx, y, cx, y + 26 * d, 'o')
        b += f'<path d="M{cx} {y+6*d}H{cx+34}" class="m" marker-end="url(#a)"/>'
        b += T(cx + 42, y + 10 * d + 4, 'A', 'tl tb')
    hx = 150 * math.cos(math.radians(22.5)); hy = 150 * math.sin(math.radians(22.5))
    b += L(cx + hx + 12, cy + hy + 12, 470, 640, 'd') + C(cx + hx, cy + hy, 2, 'inkf')
    b += L(470, 640, 560, 640, 'd') + T(474, 634, '8× Ø32 H12', 'ts')
    b += L(cx + 106, cy - 106, 470, 150, 'd') + L(470, 150, 556, 150, 'd') + T(474, 144, 'Ø300 RK', 'ts')
    b += dimh(cx - 200, cx + 200, 640, 'Ø400', frm=(cy, cy))
    # presjek
    x0, t, x1 = 650, 50, 800
    up = [[(x0, cy - 200), (x0 + t, cy - 200), (x0 + t, cy - 166), (x0, cy - 166)],
          [(x0, cy - 134), (x0 + t, cy - 134), (x0 + t, cy - 95), (x1, cy - 95), (x1, cy - 62), (x0, cy - 62)]]
    lo = [[(x0, cy + 50), (x1, cy + 50), (x1, cy + 95), (x0 + t, cy + 95), (x0 + t, cy + 134), (x0, cy + 134)],
          [(x0, cy + 166), (x0 + t, cy + 166), (x0 + t, cy + 200), (x0, cy + 200)]]
    for poly in up + lo:
        b += P(poly, '', extra='fill="url(#h)" stroke="none"') + P(poly, 'o')
    b += L(x0, cy - 50, x1, cy - 50, 'o')
    b += L(x0, cy - 166, x0 + t, cy - 166, 'o') + L(x0, cy - 134, x0 + t, cy - 134, 'o')
    b += L(630, cy, 820, cy, 'c') + L(632, cy - 150, x0 + t + 18, cy - 150, 'c') + L(632, cy + 150, x0 + t + 18, cy + 150, 'c')
    b += T(725, 160, 'A–A', 'tl tb', 'middle')
    b += dimh(x0, x0 + t, 640, '50', frm=(cy + 200, cy + 200))
    b += dimh(x0, x1, 676, '150', frm=(cy + 200, cy + 95))
    b += dimv(cy - 200, cy + 200, 920, 'Ø400', frm=(x0 + t, x0 + t))
    b += dimv(cy - 95, cy + 95, 880, 'Ø190 h7', frm=(x1, x1))
    b += dimv(cy - 50, cy + 50, 844, 'Ø100 H7', frm=(x1, x1))
    b += P([(844, cy + 64), (856, cy + 74), (832, cy + 74)], 'inkf')
    b += R(832, cy + 74, 24, 22, 'm', f'fill="{PAPER}"') + T(844, cy + 90, 'A', 'ts tb', 'middle')
    # GD&T
    gx, gy = 600, 720
    b += R(gx, gy, 190, 28, 'm', f'fill="{PAPER}"') + L(gx + 34, gy, gx + 34, gy + 28, 'm') + L(gx + 150, gy, gx + 150, gy + 28, 'm')
    b += C(gx + 17, gy + 14, 8, 'm') + C(gx + 17, gy + 14, 3.5, 'm')
    b += T(gx + 92, gy + 19, 'Ø0,02', '', 'middle') + T(gx + 170, gy + 19, 'A', 'tb', 'middle')
    b += L(gx + 190, gy + 14, 800, gy + 14, 'd') + f'<path d="M800 {gy+14}V{cy+96}" class="d" marker-end="url(#a)"/>'
    b += ra(x1 + 2, cy + 46, '0,8', 0) + ra(x0 - 2, cy - 204, '1,6', 0)
    # kontrolne točke
    for n, (x, y) in enumerate([(x0, cy - 200), (x1, cy - 95), (x1, cy - 50), (x0 + t, cy + 134), (cx, cy - 62), (cx - 200, cy)], 1):
        b += R(x - 6, y - 6, 12, 12, 'orf')
        b += T(x + 9, y - 9, f'K{n}', 'ts tb to')
    # napomene
    b += L(34, 790, 966, 790, 'm')
    nap = ['NAPOMENE:', '1. Nekotirani bridovi 0,5×45°.', '2. Opće tolerancije ISO 2768-mK.',
           '3. Poboljšano 28–32 HRC.', '4. Provrt Ø100 H7 brusiti nakon toplinske obrade.',
           '5. Kontrolne točke K1–K6 mjeriti 100 %.']
    for i, s in enumerate(nap):
        b += T(56, 820 + i * 22, s, 'ts' + (' tb' if i == 0 else ''))
    # sastavnica
    tx, ty = 560, 790
    b += L(tx, ty, tx, 966, 'm')
    rows = [('NAZIV', 'PRIRUBNICA DN100'), ('MATERIJAL', '42CrMo4 · EN 10083'), ('MJERILO', '1:4'),
            ('CRTEŽ BR.', 'STR-2611-07'), ('MASA', '14,8 kg')]
    for i, (k_, v) in enumerate(rows):
        y = ty + 30 + i * 30
        b += L(tx, y + 6, 966, y + 6, 'th') + T(tx + 12, y, k_, 'ts') + T(tx + 120, y, v, 'ts tb')
    b += L(tx + 108, ty, tx + 108, 940, 'th')
    b += R(tx, 940, 406, 26, '', f'fill="{INK}"') + T(tx + 12, 957, 'STRUG · TOKARENJE I BRUŠENJE', 'ts tw tb')
    b += T(956, 957, 'LIST 1/1', 'ts tw', 'end')
    svg('03-prirubnica-crtez.svg', W, H, b, 'Radionički crtež prirubnice DN100: nacrt, presjek A–A, kote, tolerancije i sastavnica')


# ------------------------------------------------------------------ 5. CNC PUTANJA ALATA
def putanja():
    W, H = 1000, 560
    ax = 470
    prof = [(880, ax), (880, 330), (870, 320), (720, 320), (720, 282), (600, 282), (540, 242),
            (430, 242), (430, 256), (406, 256), (406, 242), (380, 242), (380, 202), (120, 202)]
    b = R(50, 140, 70, ax - 140, 'o', 'fill="url(#h)"') + R(50, 140, 70, ax - 140, 'o')
    b += T(85, 130, 'ČELJUST', 'ts', 'middle')
    b += P([(120, 172), (890, 172), (890, ax)], 'hid', close=False) + T(620, 166, 'SIROVAC Ø110 × 160', 'ts', 'end')

    def ylim(x):
        # polumjer profila (y) na položaju x
        for (x1, y1), (x2, y2) in zip(prof[1:], prof[2:]):
            lo, hi = min(x1, x2), max(x1, x2)
            if lo <= x <= hi and x1 != x2:
                return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
        return ax
    for i, yp in enumerate(range(184, 320, 16)):
        x = 892
        while x > 122 and ylim(x) > yp + 2:
            x -= 1
        if x >= 890:
            continue
        b += f'<path d="M906 {yp}H{x}l12 -12H906" class="m or" stroke-dasharray="7 4"/>'
    fin = [(x + 5, y - 6) for x, y in prof[1:]]
    b += P(prof, 'o', close=False, extra=f'fill="none"')
    b += P([(120, ax)] + prof[::-1][:0] + [(120, 202)] + prof[::-1][:-1], '', extra=f'fill="{PAPER}" opacity=".0"')
    b += P(fin, 'or', close=False, extra='stroke-width="2.4"')
    b += L(30, ax, 960, ax, 'c')
    # pločica CNMG
    Tx, Ty = 725, 314
    e1 = (math.cos(math.radians(-5)), math.sin(math.radians(-5)))
    e2 = (math.cos(math.radians(-85)), math.sin(math.radians(-85)))
    Ls = 44
    ins = [(Tx, Ty), (Tx + Ls * e1[0], Ty + Ls * e1[1]), (Tx + Ls * (e1[0] + e2[0]), Ty + Ls * (e1[1] + e2[1])),
           (Tx + Ls * e2[0], Ty + Ls * e2[1])]
    b += P([(Tx + 14, Ty - 70), (Tx + 60, Ty - 70), (Tx + 60, Ty - 150), (Tx + 14, Ty - 150)], 'o', extra='fill="url(#hd)"')
    b += P([(Tx + 6, Ty - 4), (Tx + 52, Ty - 8), (Tx + 60, Ty - 70), (Tx + 14, Ty - 70)], 'o', extra=f'fill="{PAPER}"')
    b += P(ins, 'm', extra=f'fill="{OR}"') + C(Tx + Ls * .5 * (e1[0] + e2[0]), Ty + Ls * .5 * (e1[1] + e2[1]), 5, 'm', f'fill="{PAPER}"')
    b += L(Tx + 14, Ty - 130, Tx - 30, Ty - 130, 'd') + T(Tx - 34, Ty - 134, 'CNMG 120408', 'ts tb', 'end') + T(Tx - 34, Ty - 120, 'PCLNR 2525M12', 'ts', 'end')
    # koordinatni sustav
    b += f'<path d="M880 {ax}H950" class="m" marker-end="url(#a)"/><path d="M880 {ax}V{ax-70}" class="m" marker-end="url(#a)"/>'
    b += T(956, ax + 4, 'Z', 'tb') + T(880, ax - 78, 'X', 'tb', 'middle')
    b += C(880, ax, 9, 'm', f'fill="{PAPER}"') + f'<path d="M880 {ax}V{ax-9}A9 9 0 0 1 889 {ax}Z M880 {ax}V{ax+9}A9 9 0 0 1 871 {ax}Z" class="inkf"/>'
    b += T(866, ax + 26, 'W0', 'ts', 'end')
    # kote
    b += dimv(320, ax, 960, 'Ø64', frm=(880, 880))
    b += dimv(282, ax, 760, 'Ø80', frm=(720, 720))
    b += dimv(242, ax, 480, 'Ø100', frm=(430, 430))
    b += dimh(406, 430, 520, '4', frm=(256, 256))
    b += T(150, 60, 'G71 — GRUBA OBRADA', 'tb') + L(150, 70, 186, 70, 'm or').replace('/>', ' stroke-dasharray="7 4"/>')
    b += T(196, 74, 'ap 2,0 · f 0,3 · vc 220', 'ts')
    b += T(150, 100, 'G70 — FINA OBRADA', 'tb') + L(150, 110, 186, 110, 'or').replace('/>', ' stroke-width="2.4"/>')
    b += T(196, 114, 'dodatak 0,2 · f 0,12 · vc 260', 'ts')
    svg('04-putanja-alata.svg', W, H, b, 'CNC putanja alata: gruba (G71) i fina (G70) obrada profila vratila')


# ------------------------------------------------------------------ 6. PROCES — 4 SHEME
def proces():
    W, H = 640, 440
    # 1 ANALIZA NACRTA
    b = R(40, 40, 520, 340, 'o', f'fill="{PAPER}"') + R(52, 52, 496, 316, 'th')
    b += R(380, 318, 168, 50, 'th') + L(380, 334, 548, 334, 'th') + T(388, 330, 'STR-2611-12', 'ts tb') + T(388, 352, 'OSOVINA Ø40', 'ts')
    ax = 190
    st = [(90, 150, 30), (150, 300, 40), (300, 340, 52), (340, 450, 34)]
    for x1, x2, r in st:
        b += R(x1, ax - r, x2 - x1, 2 * r, 'o')
    b += L(74, ax, 470, ax, 'c')
    b += dimh(90, 450, 108, '360', frm=(ax - 30, ax - 34))
    b += dimv(ax - 34, ax + 34, 470, 'Ø68', frm=(450, 450))
    b += C(225, ax - 40, 20, 'm or')
    b += L(240, ax - 54, 386, 140, 'd or')
    b += C(470, 270, 118, 'o or', f'fill="{PAPER}"') + C(470, 270, 112, 'th')
    b += L(370, 230, 570, 230, 'o') + L(370, 302, 570, 302, 'th')
    b += f'<path d="M520 230V302" class="d" marker-start="url(#a)" marker-end="url(#a)"/>'
    b += T(515, 266, 'Ø80', 'ts', 'middle', rot=-90)
    b += R(392, 182, 128, 30, '', f'fill="{OR}" stroke="none"') + T(456, 202, 'Ø80 h6', 'tb tw', 'middle')
    b += T(456, 330, '0 / −0,019', 'ts tb', 'middle')
    b += ra(410, 226, '0,4')
    svg('05-proces-analiza.svg', W, H, b, 'Analiza nacrta: povećani detalj tolerancije Ø80 h6')
    # 2 TOKARENJE — rezanje
    b = ''
    top, axy, braw, bfin, xt = 60, 170, 290, 262, 330
    b += P([(20, top), (620, top), (620, bfin), (xt, bfin), (xt - 10, braw), (20, braw)], 'o', extra=f'fill="{PAPER}"')
    for k in range(1, 7):
        yy = axy - (axy - top) * math.cos(math.radians(k * 13))
        b += L(30, yy, 610, yy, 'th')
    b += P([(xt - 10, braw), (620, braw), (620, bfin), (xt, bfin)], 'hid', extra='fill="url(#dtl)"')
    b += T(600, braw + 16, 'ODVOJENI SLOJ', 'ts', 'end')
    b += L(0, axy, 640, axy, 'c')
    Tx, Ty = xt, bfin + 1
    ins = [(Tx, Ty), (Tx + 46, Ty + 6), (Tx + 52, Ty + 50), (Tx + 6, Ty + 44)]
    b += P([(Tx + 12, Ty + 30), (Tx + 120, Ty + 70), (Tx + 120, 440), (Tx + 30, 440)], 'o', extra='fill="url(#hd)"')
    b += P([(Tx + 12, Ty + 30), (Tx + 120, Ty + 70), (Tx + 120, 440), (Tx + 30, 440)], 'o')
    b += P(ins, 'o', extra=f'fill="{OR}"') + C(Tx + 26, Ty + 25, 6, 'm', f'fill="{PAPER}"')
    b += '<path d="M326 262c-18 6-30 22-22 40s32 14 34-4-18-24-30-12-6 34 12 38 34-8 28-26" class="m or"/>'
    b += f'<path d="M{xt-50} 360H{xt-150}" class="m" marker-end="url(#a)"/>' + T(xt - 100, 380, 'f 0,25 mm/okr', 'ts', 'middle')
    b += dimv(bfin, braw, xt + 160, 'ap 2', frm=(xt + 10, xt + 140))
    b += '<path d="M60 70c-30 20-30 180 0 200" class="m" marker-end="url(#a)"/>' + T(40, 60, 'n', 'tb', 'middle')
    b += f'<path d="M{xt-6} {bfin+6}l-60 30" class="m or" marker-end="url(#ao)"/>' + T(xt - 74, bfin + 52, 'vc 240 m/min', 'ts to', 'end')
    b += T(36, top - 16, 'OBRADAK · C45 · Ø84 → Ø80', 'ts tb')
    svg('06-proces-tokarenje.svg', W, H, b, 'Tokarenje: zahvat pločice, posmak f, dubina rezanja ap i odvojena strugotina')
    # 3 BRUŠENJE — kružno brušenje
    b = ''
    wx, wy, R_ = 215, 230, 165
    px, py, r_ = wx + R_ + 52, wy, 52
    b += (f'<path d="M{wx-R_} {wy}a{R_} {R_} 0 1 0 {2*R_} 0a{R_} {R_} 0 1 0 {-2*R_} 0Z'
          f'M{wx-62} {wy}a62 62 0 1 0 124 0a62 62 0 1 0 -124 0Z" fill="url(#dt)" fill-rule="evenodd" stroke="none"/>')
    b += C(wx, wy, R_, 'o') + C(wx, wy, R_ - 12, 'th') + C(wx, wy, 62, 'o', f'fill="{PAPER}"')
    b += C(wx, wy, 26, 'm') + C(wx, wy, 4, 'inkf')
    for a in range(0, 360, 60):
        b += C(wx + 44 * math.cos(math.radians(a)), wy + 44 * math.sin(math.radians(a)), 5, 'th')
    b += C(px, py, r_, 'o', f'fill="{PAPER}"') + C(px, py, r_ - 8, 'th') + C(px, py, 5, 'm')
    b += L(px - 70, py, px + 70, py, 'c') + L(px, py - 70, px, py + 70, 'c') + L(wx - R_ - 20, wy, wx + 30, wy, 'c') + L(wx, wy - R_ - 20, wx, wy + R_ + 20, 'c')
    b += f'<path d="M{wx-100} {wy-205}A230 230 0 0 1 {wx+80} {wy-205}" class="m" marker-end="url(#a)"/>' + T(wx - 10, wy - 216, 'vs 35 m/s', 'ts tb', 'middle')
    b += f'<path d="M{px+40} {py-78}A90 90 0 0 0 {px-36} {py-80}" class="m" marker-end="url(#a)"/>' + T(px + 18, py - 96, 'vw 0,3 m/s', 'ts tb', 'middle')
    cx_ = wx + R_
    rnd = random.Random(7)
    for i in range(14):
        a = math.radians(rnd.uniform(70, 125))
        l1, l2 = rnd.uniform(10, 30), rnd.uniform(60, 150)
        b += L(cx_ + l1 * math.cos(a), wy + l1 * math.sin(a), cx_ + l2 * math.cos(a), wy + l2 * math.sin(a), 'm or')
    b += P([(cx_ + 6, wy - 150), (cx_ + 40, wy - 150), (cx_ + 18, wy - 66), (cx_ + 8, wy - 66)], 'o', extra=f'fill="{PAPER}"')
    for dx in (-6, 0, 6):
        b += L(cx_ + 13, wy - 60, cx_ + 3 + dx, wy - 14, 'th hid')
    b += T(cx_ + 46, wy - 140, 'SHIP', 'ts')
    b += f'<path d="M20 {wy}H{wx-R_-6}" class="m or" marker-end="url(#ao)"/>' + T(22, wy - 10, 'ae 0,005', 'ts to')
    b += T(wx, wy + R_ + 40, 'BRUSNA PLOČA Ø400 · 89A60K', 'ts tb', 'middle')
    b += T(px, py + 84, 'Ø40 h5 · Ra 0,2', 'ts tb', 'middle')
    svg('07-proces-brusenje.svg', W, H, b, 'Kružno brušenje: brusna ploča, obradak, smjerovi vrtnje, iskre i dovod SHIP-a')
    # 4 KONTROLA
    b = ''
    ax = 150
    st = [(60, 180, 46), (180, 330, 60), (330, 380, 74), (380, 560, 40)]
    for x1, x2, r in st:
        b += R(x1, ax - r, x2 - x1, 2 * r, 'o', f'fill="{PAPER}"')
    b += L(40, ax, 600, ax, 'c')
    pts = [(80, ax - 46), (140, ax + 46), (210, ax - 60), (300, ax + 60), (355, ax - 74), (420, ax + 40), (500, ax - 40), (550, ax + 40)]
    for i, (x, y) in enumerate(pts):
        for j in range(i + 1, min(i + 3, len(pts))):
            b += L(x, y, *pts[j], 'th hid')
    b += P([(330, 20), (322, 40), (338, 40)], 'm') + L(330, 40, 330, ax - 74 - 4, 'm') + C(330, ax - 78, 4, 'm', f'fill="{PAPER}"')
    for x, y in pts:
        b += C(x, y, 6, 'orf') + C(x, y, 11, 'th or')
    gx, gy, gw, gh = 60, 280, 500, 120
    b += L(gx, gy + gh, gx + gw, gy + gh, 'm') + L(gx, gy, gx, gy + gh, 'm')
    b += L(gx, gy + 20, gx + gw, gy + 20, 'hid or') + L(gx, gy + gh - 20, gx + gw, gy + gh - 20, 'hid or') + L(gx, gy + gh / 2, gx + gw, gy + gh / 2, 'th')
    b += T(gx - 6, gy + 24, '+0', 'ts', 'end') + T(gx - 6, gy + gh - 16, '−19', 'ts', 'end') + T(gx + gw, gy - 6, 'Ø80 h6 · 12 KOMADA · Cpk 1,67', 'ts tb', 'end')
    rnd = random.Random(3)
    vals = [gy + gh / 2 + rnd.uniform(-26, 26) for _ in range(12)]
    pl = [(gx + 20 + i * 40, v) for i, v in enumerate(vals)]
    b += P(pl, 'm', close=False)
    for x, y in pl:
        b += R(x - 3.5, y - 3.5, 7, 7, '', f'fill="{INK}"')
    b += T(gx + 4, gy + gh + 18, 'µm', 'ts')
    svg('08-proces-kontrola.svg', W, H, b, 'Završna kontrola: mjerne točke na vratilu i dijagram odstupanja unutar tolerancije')


# ------------------------------------------------------------------ 7. TEŠKA TOKARILICA — INDUSTRIJE
def industrije():
    W, H = 800, 900
    b = C(250, 300, 190, 'orf') + R(470, 40, 92, 580, 'orf')
    g = 840
    b += L(0, g, 800, g, 'o')
    b += P([(0, g), (800, g), (800, 900), (0, 900)], '', extra='fill="url(#hd)" stroke="none" opacity=".55"')
    b += P([(760, g), (800, g), (800, 860), (520, 900), (420, 900)], '', extra='fill="url(#hd)" stroke="none"')
    b += P([(30, 800), (40, 560), (250, 560), (250, 800)], 'o', extra='fill="url(#dt)"') + P([(30, 800), (40, 560), (250, 560), (250, 800)], 'o')
    b += R(60, 590, 150, 70, 'm', f'fill="{PAPER}"')
    for y in range(600, 652, 8):
        b += L(72, y, 198, y, 'th')
    b += R(250, 540, 52, 250, 'o', f'fill="{PAPER}"') + R(262, 540, 28, 250, 'th', 'fill="url(#h)"')
    b += R(302, 556, 20, 40, 'm', f'fill="{PAPER}"') + R(302, 724, 20, 40, 'm', f'fill="{PAPER}"')
    b += R(322, 575, 330, 170, 'o', f'fill="{PAPER}"')
    b += R(322, 660, 330, 85, '', 'fill="url(#dt)" stroke="none"')
    for k in range(1, 8):
        yy = 660 - 85 * math.cos(math.radians(k * 11))
        b += L(326, yy, 648, yy, 'th')
    b += L(300, 660, 760, 660, 'c')
    b += P([(652, 660), (676, 640), (676, 680)], 'm', extra=f'fill="{PAPER}"')
    b += P([(676, 800), (676, 610), (700, 590), (770, 590), (780, 610), (780, 800)], 'o', extra='fill="url(#dt)"')
    b += P([(676, 800), (676, 610), (700, 590), (770, 590), (780, 610), (780, 800)], 'o')
    b += R(20, 790, 770, 24, 'o', f'fill="{PAPER}"') + R(40, 814, 730, 26, 'o', 'fill="url(#h)"')
    b += R(440, 760, 140, 30, 'o', f'fill="{PAPER}"') + R(470, 745, 80, 15, 'm', f'fill="{PAPER}"')
    b += P([(495, 745), (515, 745), (505, 734)], '', extra=f'fill="{OR}" stroke="{INK}"')
    # čovjek u mjerilu
    hx = 600
    b += C(hx, g - 70, 6, 'm', f'fill="{PAPER}"') + L(hx, g - 64, hx, g - 32, 'm') + L(hx, g - 32, hx - 6, g, 'm') + L(hx, g - 32, hx + 6, g, 'm')
    b += L(hx, g - 56, hx - 9, g - 38, 'm') + L(hx, g - 56, hx + 9, g - 40, 'm')
    b += dimv(g - 76, g, hx + 30, '1,8 m', frm=(hx + 8, hx + 8))
    b += T(40, 532, 'TEŠKA TOKARILICA · Ø1200 × 6000', 'ts tb')
    svg('09-teska-tokarilica.svg', W, H, b, 'Teška tokarilica s velikim valjkom i čovjekom u mjerilu, narančasti krug i stup')


# ------------------------------------------------------------------ 8. STEZNA GLAVA — CTA
def stezna():
    W = H = 520
    cx = cy = 260
    b = C(cx, cy, 214, 'th hid') + C(cx, cy, 200, 'o', f'fill="{PAPER}"') + C(cx, cy, 186, 'th')
    for a in range(0, 360, 4):
        t = math.radians(a)
        b += L(cx + 188 * math.cos(t), cy + 188 * math.sin(t), cx + 199 * math.cos(t), cy + 199 * math.sin(t), 'th')
    b += C(cx, cy, 120, 'm', 'fill="url(#dtl)"') + C(cx, cy, 120, 'm')
    for a in (-30, 90, 210):
        t = math.radians(a)
        b += C(cx + 152 * math.cos(t), cy + 152 * math.sin(t), 11, 'm', f'fill="{PAPER}"') + C(cx + 152 * math.cos(t), cy + 152 * math.sin(t), 5, 'th')
    for a in (-90, 30, 150):
        jaw = [(64, -22), (64, 22), (100, 22), (100, 30), (176, 30), (176, -30), (100, -30), (100, -22)]
        t = math.radians(a)
        rot = [(cx + u * math.cos(t) - v * math.sin(t), cy + u * math.sin(t) + v * math.cos(t)) for u, v in jaw]
        slot = [(56, -34), (56, 34), (186, 34), (186, -34)]
        rs = [(cx + u * math.cos(t) - v * math.sin(t), cy + u * math.sin(t) + v * math.cos(t)) for u, v in slot]
        b += P(rs, 'th', extra='fill="url(#h)"') + P(rs, 'th')
        b += P(rot, 'o', extra=f'fill="{PAPER}"')
        for u in range(110, 172, 8):
            b += L(cx + u * math.cos(t) + 28 * math.sin(t), cy + u * math.sin(t) - 28 * math.cos(t),
                   cx + u * math.cos(t) - 28 * math.sin(t), cy + u * math.sin(t) + 28 * math.cos(t), 'th')
    b += C(cx, cy, 62, 'o', f'fill="{OR}"') + C(cx, cy, 44, 'th', f'stroke="{INK}"') + C(cx, cy, 8, 'm', f'fill="{PAPER}"')
    b += L(cx - 240, cy, cx + 240, cy, 'c') + L(cx, cy - 240, cx, cy + 240, 'c')
    b += T(cx + 220, cy + 236, 'Ø250 · 3 ČELJUSTI', 'ts', 'end')
    svg('10-stezna-glava.svg', W, H, b, 'Stezna glava s tri čeljusti i obratkom, nacrt')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    hero(); vratilo(); ikone(); prirubnica(); putanja(); proces(); industrije(); stezna()
