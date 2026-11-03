#!/usr/bin/env python3
"""Procedural audio for the Yara' hook. Every sound is synthesised here (numpy only) with fixed seeds,
so the audio is original, deterministic and licence-free. Output: public/audio/sfx/*.wav + public/audio/bgm.wav.
Why synthesis: Freesound was unreachable from the build sandbox (HTTP 403 from the proxy), and the skill
forbids silently falling back to the old shared library."""
import numpy as np, wave, os, json, hashlib

SR = 48000
rng = np.random.default_rng(1234)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
os.makedirs(os.path.join(OUT, 'sfx'), exist_ok=True)

def t_(d): return np.arange(int(SR * d)) / SR
def env_exp(n, tau): return np.exp(-np.arange(n) / (SR * tau))
def fade(x, a=0.004, b=0.01):
    n = len(x); fi = int(SR * a); fo = int(SR * b)
    x = x.copy()
    if fi: x[:fi] *= np.linspace(0, 1, fi)
    if fo: x[-fo:] *= np.linspace(1, 0, fo)
    return x
def band_noise(d, lo, hi, seed=0):
    r = np.random.default_rng(seed); n = int(SR * d)
    spec = np.fft.rfft(r.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    k = max(1, int(len(f) * 0.002)); m = np.convolve(m, np.ones(k) / k, mode='same')
    y = np.fft.irfft(spec * m, n); return y / (np.max(np.abs(y)) + 1e-9)
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * t_(d) + ph)
def norm(x, peak=0.9): return x / (np.max(np.abs(x)) + 1e-9) * peak
def save(name, x, sub='sfx'):
    x = np.clip(x, -1, 1)
    path = os.path.join(OUT, sub, name + '.wav') if sub else os.path.join(OUT, name + '.wav')
    stereo = x.ndim == 2
    pcm = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2 if stereo else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    return path
def sweep(f0, f1, d, curve=2.0):
    t = t_(d); p = (t / d) ** curve
    f = f0 + (f1 - f0) * p
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

lib = {}

# --- impacts / thumps
def thump(d=0.45, f0=110, f1=42):
    n = int(SR * d); x = sweep(f0, f1, d, 0.35) * env_exp(n, 0.14)
    click = band_noise(d, 800, 5000, 5)[:n] * env_exp(n, 0.012) * 0.35
    return fade(norm(x + click))
lib['thump'] = thump()
lib['thump_soft'] = norm(thump(0.35, 90, 48) * 0.8)
def impact_big():
    d = 2.6; n = int(SR * d); x = sweep(95, 34, d, 0.3) * env_exp(n, 0.55)
    x += 0.5 * sine(55, d) * env_exp(n, 0.9)
    x += 0.35 * band_noise(d, 150, 3000, 9)[:n] * env_exp(n, 0.25)
    return fade(norm(x), 0.002, 0.2)
lib['impact_big'] = impact_big()

# --- whooshes (airy, no game tone): band noise with a swept amplitude
def whoosh(d, lo, hi, peak=0.5, seed=3):
    n = int(SR * d); x = band_noise(d, lo, hi, seed)[:n]
    t = np.linspace(0, 1, n); e = np.sin(np.pi * np.clip(t / (peak * 2) if peak <= 0.5 else t, 0, 1)) ** 2
    e = np.where(t < peak, (t / peak) ** 1.6, ((1 - t) / (1 - peak)) ** 1.8)
    return fade(norm(x * e), 0.01, 0.02)
lib['whoosh_short'] = whoosh(0.28, 600, 7000, 0.4, 11)
lib['whoosh_air'] = whoosh(1.2, 300, 5200, 0.6, 12)
lib['whoosh_exit'] = whoosh(1.0, 400, 6000, 0.35, 13)
lib['breath_swell'] = whoosh(0.9, 500, 3500, 0.55, 14)

# --- risers: filtered noise rising + tone glide, ends at the impact frame
def riser(d, f0=180, f1=1800):
    n = int(SR * d); t = np.linspace(0, 1, n)
    nz = band_noise(d, 1500, 9000, 21)[:n] * t ** 2.4
    ton = sweep(f0, f1, d, 2.2) * (t ** 2.0) * 0.5
    return fade(norm(nz * 0.7 + ton * 0.5), 0.05, 0.004)
lib['riser_2s'] = riser(2.4, 160, 1500)
lib['riser_plunge'] = riser(0.5, 400, 3000)

# --- glass tinks (real-world glass: inharmonic partials, fast decay, tiny click)
def tink(f=2900, d=0.7, seed=0):
    r = np.random.default_rng(seed); n = int(SR * d); x = np.zeros(n)
    for ratio, amp, tau in [(1, 1, 0.22), (2.32, 0.6, 0.15), (4.19, 0.42, 0.09), (6.7, 0.25, 0.05)]:
        x += amp * np.sin(2 * np.pi * f * ratio * t_(d) + r.uniform(0, 6)) * env_exp(n, tau)
    x += 0.4 * band_noise(d, 3000, 9000, seed + 40)[:n] * env_exp(n, 0.004)
    return fade(norm(x), 0.0006, 0.05)
lib['tink_a'] = tink(2900, 0.7, 1)
lib['tink_b'] = tink(3350, 0.6, 2)
lib['tink_lid'] = tink(1650, 0.9, 3)

# --- bells / sparkle (warm, soft: used at the hero birth and the final shine)
def bell(f, d=1.6, bright=0.5):
    n = int(SR * d); x = np.zeros(n)
    for ratio, amp, tau in [(1, 1, 0.9), (2.0, 0.5, 0.6), (3.0, 0.3 * bright * 2, 0.4), (4.2, 0.22 * bright * 2, 0.25), (5.4, 0.12, 0.15)]:
        x += amp * np.sin(2 * np.pi * f * ratio * t_(d)) * env_exp(n, tau)
    return fade(norm(x), 0.002, 0.15)
lib['bell_birth'] = bell(880)
lib['bell_hi'] = bell(1318, 1.4)
def sparkle_tail(d=2.2):
    n = int(SR * d); x = np.zeros(n); r = np.random.default_rng(77)
    for k in range(34):
        t0 = int(r.uniform(0, d * 0.7) * SR); f = r.choice([2093, 2349, 2637, 3136, 3520, 4186])
        m = min(n - t0, int(0.35 * SR)); tt = np.arange(m) / SR
        x[t0:t0 + m] += (0.9 ** k) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.09)
    return fade(norm(x), 0.001, 0.3)
lib['sparkle_tail'] = sparkle_tail()
def shimmer_up(d=1.3):
    n = int(SR * d); x = np.zeros(n); r = np.random.default_rng(31)
    for k in range(40):
        t0 = int(((k / 40) ** 1.3) * d * 0.85 * SR); f = 1200 + 3600 * (k / 40) ** 1.2
        m = min(n - t0, int(0.22 * SR)); tt = np.arange(m) / SR
        x[t0:t0 + m] += (0.4 + 0.6 * k / 40) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.06)
    return fade(norm(x), 0.002, 0.2)
lib['shimmer_up'] = shimmer_up()

# --- ignition ticks (soft electric flicker of a lantern: not a UI bleep)
def tick(f, seed):
    d = 0.22; n = int(SR * d)
    x = band_noise(d, 2000, 8000, seed)[:n] * env_exp(n, 0.012) + 0.5 * np.sin(2 * np.pi * f * t_(d)) * env_exp(n, 0.07)
    return fade(norm(x), 0.0005, 0.03)
lib['tick_a'] = tick(1760, 61); lib['tick_b'] = tick(2217, 62); lib['tick_c'] = tick(1397, 63)
def key_tone(f, d=0.9):
    n = int(SR * d); x = sine(f, d) * env_exp(n, 0.35) + 0.4 * sine(f * 2, d) * env_exp(n, 0.2) + 0.2 * sine(f * 3, d) * env_exp(n, 0.12)
    x += 0.3 * band_noise(d, 3000, 8000, 71)[:n] * env_exp(n, 0.01)
    return fade(norm(x), 0.001, 0.1)
lib['key_1'] = key_tone(784); lib['key_2'] = key_tone(988); lib['key_3'] = key_tone(1175)

# --- paper / card deal
def pat(f0, seed):
    d = 0.2; n = int(SR * d)
    x = sweep(f0, f0 * 0.5, d, 0.5) * env_exp(n, 0.04) + 0.5 * band_noise(d, 400, 3500, seed)[:n] * env_exp(n, 0.02)
    return fade(norm(x), 0.001, 0.03)
lib['pat_a'] = pat(180, 81); lib['pat_b'] = pat(220, 82)
lib['card_whip'] = whoosh(0.22, 1500, 9000, 0.35, 15)

# --- beds
def heartbeat():
    d = 1.1; n = int(SR * d); x = np.zeros(n)
    for t0, a in [(0.0, 1.0), (0.22, 0.7)]:
        i = int(t0 * SR); m = int(0.28 * SR)
        x[i:i + m] += a * sweep(70, 40, 0.28, 0.4) * env_exp(m, 0.08)
    return fade(norm(x), 0.002, 0.05)
lib['heartbeat'] = heartbeat()
def crickets(d=6.0):
    n = int(SR * d); x = np.zeros(n); r = np.random.default_rng(5)
    for c in range(14):
        t0 = r.uniform(0, d - 0.6); f = r.uniform(4200, 5200); period = r.uniform(0.07, 0.1); pulses = r.integers(3, 6)
        for k in range(pulses):
            i = int((t0 + k * period) * SR); m = int(0.035 * SR); tt = np.arange(m) / SR
            if i + m < n: x[i:i + m] += np.sin(2 * np.pi * f * tt) * np.hanning(m) * 0.5
    return fade(norm(x, 0.5), 0.3, 0.5)
lib['crickets'] = crickets()
def room_air(d=5.0):
    n = int(SR * d); x = band_noise(d, 60, 900, 91)[:n]
    return fade(norm(x, 0.5), 0.8, 0.8)
lib['room_air'] = room_air()
def sky_lowpass(): pass

# ---------------------------------------------------------------- BGM (stereo, ~20s)
def ks(f, d, decay=0.996, seed=0):
    r = np.random.default_rng(seed); N = int(SR / f); buf = r.uniform(-1, 1, N); n = int(SR * d); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % N]; buf[i % N] = decay * 0.5 * (buf[i % N] + buf[(i + 1) % N])
    return fade(out / (np.max(np.abs(out)) + 1e-9), 0.001, 0.1)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
TOTAL = 20.0
n_tot = int(SR * TOTAL); bgm = np.zeros((n_tot, 2))
def place(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); m = min(len(sig), n_tot - i)
    if m <= 0 or i < 0: return
    l = gain * (1 - max(0, pan)); r = gain * (1 + min(0, pan))
    bgm[i:i + m, 0] += sig[:m] * l; bgm[i:i + m, 1] += sig[:m] * r
def pad(notes, d, gain=0.5):
    n = int(SR * d); t = np.arange(n) / SR; x = np.zeros(n)
    for k, m in enumerate(notes):
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            x += np.sin(2 * np.pi * f * (1 + det * 0.01) * t + k) * (1.0 if det == 0 else 0.6)
        x += 0.25 * np.sin(2 * np.pi * f * 2 * t)
    a = int(SR * 1.6); b = int(SR * 1.4)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a) ** 1.5; e[-b:] = np.linspace(1, 0, b) ** 1.2
    return norm(x * e, gain)
FPS = 30; f2t = lambda f: f / FPS
# chords: Dm9 -> Bbmaj7 -> Gm9 -> Dsus -> resolve D
place(pad([38, 50, 57, 62, 65], 5.6), f2t(33), 0.30)            # desk: Dm
place(pad([34, 46, 53, 58, 62], 3.2), f2t(165) - 0.4, 0.12)     # night: Bb, thinner
place(pad([43, 55, 58, 62, 65], 3.4), f2t(255) + 0.3, 0.30)      # jar: Gm
place(pad([41, 53, 57, 60, 64], 3.3), f2t(345), 0.32)            # cards: Fmaj
place(pad([38, 50, 57, 62, 66, 69], 5.0), f2t(546) - 0.15, 0.55) # name: D major, the resolution
# low drone through the night shot (tension)
dr = sine(36.7, 3.4) * 0.5 + sine(73.4, 3.4) * 0.15; place(fade(norm(dr, 0.10), 0.8, 0.6), f2t(165), 1.0)
# harp plucks: pentatonic (D F G A C), sparse over the desk/night, one per firefly arrival, one per card cue
penta = [62, 65, 67, 69, 72, 74, 77, 79]
def pluck(m, t0, gain, pan=0.0, seed=0): place(ks(midi(m), 1.6, 0.9965, seed), f2t(t0) if t0 > 30 else t0, gain, pan)
for i, f in enumerate([55, 70, 85, 100, 122, 140, 152]): place(ks(midi(penta[(i * 3) % 6]), 1.6, 0.9965, i), f2t(f), 0.16, (-1) ** i * 0.3)
for i, f in enumerate([188, 214, 233]): place(ks(midi(penta[(i * 2 + 1) % 6] - 12), 1.8, 0.997, 30 + i), f2t(f), 0.12, -0.2)
arr = [30, 38, 44, 49, 53, 57, 60, 63, 66, 69, 72]
for i, a in enumerate(arr): place(ks(midi(penta[min(i, 7)] + (12 if i > 7 else 0)), 1.4, 0.9965, 50 + i), f2t(255 + a), 0.2 - 0.004 * i, (-1) ** i * 0.35)
cues = [14, 23, 30.5, 36.5, 41]
for i, c in enumerate(cues): place(ks(midi([62, 65, 69, 72, 74][i]), 1.2, 0.996, 90 + i), f2t(345 + c + 9), 0.2, (-1) ** i * 0.3)
# a gentle pulse under the cards (muted soft kick every ~0.5s, accelerating with the deal)
for k, f in enumerate([358, 368, 377, 385, 392, 398]):
    place(lib['thump_soft'][:int(SR * 0.3)] * 0.5, f2t(f), 0.35)
# name: key plucks on the three-beat + reveal chord arpeggio
for i, f in enumerate([441 + 86, 441 + 93, 441 + 99]): place(ks(midi([74, 77, 81][i]), 1.6, 0.997, 120 + i), f2t(f), 0.22)
for i, m in enumerate([62, 66, 69, 74, 78, 81]): place(ks(midi(m), 2.4, 0.9972, 140 + i), f2t(546) + 0.07 * i, 0.22, (-1) ** i * 0.3)
# silences (match the picture): teaser black beat and the night->jar black beat are really silent
def duck(t0, t1, ramp_s=0.04):
    i0, i1 = int(t0 * SR), int(t1 * SR); g = np.ones(n_tot)
    g[i0:i1] = 0; r = int(ramp_s * SR)
    if i0 - r >= 0: g[i0 - r:i0] = np.linspace(1, 0, r)
    g[i1:i1 + r] = np.linspace(0, 1, r); bgm[:] *= g[:, None]
duck(0.0, f2t(33)); duck(f2t(249), f2t(255) + 0.05, 0.08)
# master fade out
fo = int(SR * 1.0); bgm[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
bgm = bgm / (np.max(np.abs(bgm)) + 1e-9) * 0.85

manifest = {}
for k, v in lib.items():
    p = save(k, v); manifest[k] = {'file': f'audio/sfx/{k}.wav', 'dur_s': round(len(v) / SR, 3), 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()}
p = save('bgm', bgm, None); manifest['bgm'] = {'file': 'audio/bgm.wav', 'dur_s': TOTAL, 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()}
json.dump({'generator': 'tools/make_audio.py', 'license': 'Original work generated by tools/make_audio.py for this project (no third-party samples, recordings or code-derived audio). Released with the project under its licence; no attribution required.', 'note': 'Freesound unreachable from sandbox (HTTP 403); not auditioned by ear, measured only', 'items': manifest}, open(os.path.join(OUT, 'audio-manifest.json'), 'w'), indent=1)
print(len(manifest), 'files')
