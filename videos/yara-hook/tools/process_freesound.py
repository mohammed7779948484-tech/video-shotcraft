#!/usr/bin/env python3
"""Cut the action window out of each downloaded Freesound preview (public/audio/fs/*.mp3), peak-normalise it to
0.9 (same scale as the synthesised fallbacks), add short fades and write public/audio/sfx/<cue>.wav, replacing the
synthetic stand-in of that cue. Every cut/gain is recorded in public/audio/audio-manifest.json -> "freesound_cues".
Run AFTER tools/make_audio.py:   python3 tools/make_audio.py && python3 tools/process_freesound.py
Windows come from the analysis the sfx-source tool stored in public/audio/fs/audio-manifest.json (energy peak,
activity window); "start" is placed a few ms before the energy peak so the pinned frame lands on the hit.
The previews are lossy MP3 (not uploader originals). Nothing here has been auditioned by ear."""
import json, os, subprocess, wave, hashlib
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', 'public', 'audio')
SR = 48000

# cue -> (freesound id, start s, duration s, fade-in s, fade-out s, why)
CUES = {
    'thump':        ('428073', 0.43, 0.26, 0.002, 0.12, 'teaser cut hits: sub drop; window starts 60 ms before its energy peak (0.495 s) and stops before the swell body so hit 3 does not run into the black beat'),
    'impact_big':   ('856174', 1.00, 2.60, 0.002, 0.60, 'flash + REVEAL impact: deep sub-bass drop, energy peak 1.035 s'),
    'tink_a':       ('738633', 0.44, 0.55, 0.001, 0.12, 'glass clink #1 (two drinking glasses), activity 0.47-0.77 s; preview peaks at +1.25 dBFS so it is normalised down'),
    'tink_b':       ('560298', 0.56, 0.70, 0.001, 0.15, 'glass clink #2 (different glass, double-sample alternation), energy peak 0.595 s'),
    'tink_lid':     ('262958', 0.00, 0.20, 0.0005, 0.04, 'glass tap, 0.2 s, hero lands / lid note'),
    'card_whip':    ('267950', 0.05, 0.24, 0.004, 0.08, 'short whoosh for a card leaving the glow'),
    'pat_a':        ('120508', 0.00, 0.13, 0.0005, 0.03, 'playing-card snap for the landing'),
    'pat_b':        ('784658', 0.00, 0.25, 0.001, 0.08, 'soft sub kick (felt body of the card landing); different timbre from pat_a so alternation is real'),
    'whoosh_air':   ('701104', 0.22, 1.05, 0.05, 0.40, 'soft air whoosh for pull-back and dissolve (light transition)'),
    'whoosh_exit':  ('701104', 0.30, 0.90, 0.04, 0.35, 'hero exits through the window'),
    'whoosh_short': ('267950', 0.00, 0.28, 0.004, 0.10, 'lead-in whoosh before teaser cuts'),
    'riser_2s':     ('685256', 0.65, 2.40, 0.30, 0.00, 'riser into the reveal; source ends at its peak (2.745 s) so the end lands on the pin'),
    'riser_plunge': ('685256', 2.55, 0.50, 0.03, 0.00, 'last 0.5 s of the same riser: plunge into the glass'),
    'sparkle_tail': ('639429', 0.15, 2.05, 0.002, 0.50, 'crystal twinkle after the impact, energy peak 0.195 s'),
    'bell_birth':   ('844398', 0.20, 1.60, 0.05, 0.40, 'mysterious sparkle flourish: the firefly condenses'),
    'bell_hi':      ('759840', 0.00, 0.65, 0.002, 0.10, 'shining/ringing little bells: tagline lands'),
    'heartbeat':    ('384662', 0.00, 0.47, 0.002, 0.05, 'lub-dub heartbeat, used twice with falling level'),
    'crickets':     ('424871', 1.00, 3.00, 0.30, 0.40, 'night bed under the field (source 11.56 s, 3 s window)'),
    'key_1':        ('560298', 0.56, 0.70, 0.001, 0.15, 'key fragment 1 of 3: real glass (replaces the synthetic G5 tone; reviewer: rising pitched triad read as a confirmation arpeggio)'),
    'key_2':        ('738633', 0.44, 0.55, 0.001, 0.12, 'key fragment 2 of 3: real glass'),
    'key_3':        ('262958', 0.00, 0.20, 0.0005, 0.04, 'key fragment 3 of 3: real glass tap'),
    'wing_flap':    ('561009', 0.20, 1.60, 0.05, 0.25, 'light wing flap foley for the hero flight (source peak is -25 dBFS: +22 dB gain)'),
}

def decode(path, start, dur):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').astype(float)  # float: MP3 previews can decode above 0 dBFS; never clip before normalising

def save(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())

fs_manifest = json.load(open(os.path.join(ROOT, 'fs', 'audio-manifest.json')))['assets']
by_id = {a['id'].split(':')[1]: a for a in (fs_manifest.values() if isinstance(fs_manifest, dict) else fs_manifest)}
out = {}
for cue, (fid, start, dur, fi, fo, why) in CUES.items():
    src = os.path.join(ROOT, 'fs', f'fs-{fid}.mp3')
    x = decode(src, start, dur)
    pk0 = float(np.max(np.abs(x)) + 1e-12)
    gain = min(0.9 / pk0, 10 ** (32 / 20))
    x = x * gain
    n = len(x); a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    dst = os.path.join(ROOT, 'sfx', cue + '.wav'); save(dst, x)
    a_ = by_id[fid]
    out[cue] = {
        'source': a_['id'], 'title': a_['title'], 'author': a_['author'], 'page': a_['page_url'],
        'license': a_['license_url'], 'source_file_is_preview_mp3': True, 'source_sha256': a_['sha256'],
        'window_s': [start, round(start + dur, 3)], 'gain_db': round(20 * np.log10(gain), 1),
        'result_peak_dbfs': round(20 * np.log10(float(np.max(np.abs(x)) + 1e-12)), 2), 'fade_in_s': fi, 'fade_out_s': fo,
        'file': f'audio/sfx/{cue}.wav', 'sha256': hashlib.sha256(open(dst, 'rb').read()).hexdigest(), 'why': why,
        'auditioned_by_ear': False,
    }
    print(f'{cue:13s} <- fs:{fid:7s} gain {out[cue]["gain_db"]:+5.1f} dB  {n / SR:.2f}s')

# ---- write the edit record back into the downloaded-asset manifest and credits (sfx-sourcing.md: record what was changed)
fs_path = os.path.join(ROOT, 'fs', 'audio-manifest.json')
fsm = json.load(open(fs_path))
rows = fsm['assets'].values() if isinstance(fsm['assets'], dict) else fsm['assets']
by_file = {}
for cue, rec in out.items():
    by_file.setdefault(rec['source'].split(':')[1], []).append(f"{cue}: window {rec['window_s'][0]}-{rec['window_s'][1]} s, gain {rec['gain_db']:+.1f} dB (float decode, peak-normalised to 0.9), fade-in {rec['fade_in_s']} s / out {rec['fade_out_s']} s -> {rec['file']} (sha256 {rec['sha256'][:12]})")
for row in rows:
    fid = row['id'].split(':')[1]
    row['changes'] = by_file.get(fid, ['NOT USED in the film (rejected: preview peaks too low, would need ~+30 dB and raise the noise floor)'])
json.dump(fsm, open(fs_path, 'w'), indent=2)
import re
cp = os.path.join(ROOT, 'fs', 'FREESOUND-CREDITS.md')
txt = open(cp).read()
blocks = txt.split('~~~text\n')
new = [blocks[0]]
for b in blocks[1:]:
    m = re.match(r'fs-(\d+)\.mp3', b)
    if m:
        ch = by_file.get(m.group(1), ['NOT USED in the film (rejected: preview peaks too low)'])
        b = re.sub(r'Edits: .*?\n', 'Edits: ' + ' | '.join(ch).replace('\\', '/') + '\n', b, count=1)
    new.append(b)
open(cp, 'w').write('~~~text\n'.join(new))

mpath = os.path.join(ROOT, 'audio-manifest.json')
m = json.load(open(mpath))
for k in out:
    m.get('items', {}).pop(k, None)  # superseded synthetic stand-ins
m['freesound_cues'] = out
m['note'] = ('Cues listed in freesound_cues are CC0 Freesound recordings (lossy MP3 previews, windowed + normalised by '
             'tools/process_freesound.py). The remaining SFX (ticks, key tones, shimmer, breath swell, room air) and the score are '
             'original synthesis (tools/make_audio.py). Nothing was auditioned by ear; measured only.')
m['license'] = ('Freesound cues: CC0-1.0 per source page (no attribution required; credits kept in public/audio/fs/FREESOUND-CREDITS.md). '
                'Synthesised audio: original work of this project.')
json.dump(m, open(mpath, 'w'), indent=1)
print(len(out), 'cues replaced with Freesound recordings')
