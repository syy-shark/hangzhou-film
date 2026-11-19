// spec.ts — the film's contract. Every number, colour, type size and copy line lives here once,
// tagged with its ledger id (S01…). Scenes read from here; they never re-hard-code a contract value.
//
// S01 format     1920 × 1080, 30 fps, 60 s (a calm 60 BPM: one beat = one second, one bar = four)
// S02 palette    rice paper / ink / seal red / celadon / tea ochre — one accent family, seal red used once
// S03 type       Songti SC for CJK display; PingFang SC for tracked Latin labels. No sans-serif CJK display.
// S04 copy       vertical place names + one four-character line each; the city is named only in the last scene
// S05 motion     60 BPM, EASE.smooth over 0.8–1.6 s, EASE.out for ink spreading. No overshoot.
// S06 ban        no gradient, no glow, no neon, no 3-D, no emoji, no crossfade as a transition

export const FILM = {duration: 60, fps: 30, width: 1920, height: 1080, bpm: 60, sound: true}; // S01
export const SAFE = {x: 150, y: 90};                                                            // S01

export const SERIF = "'Songti SC', 'STSong', 'Noto Serif SC', 'Times New Roman', serif";         // S03
export const SANS = "'PingFang SC', 'Hiragino Sans GB', 'Helvetica Neue', sans-serif";           // S03

export const COLOR = {
  paper: '#F2ECE0',      // S02 rice paper
  paperLt: '#FBF7EF',    // S02 lifted paper (snow, seal knock-out)
  ink: '#1A1714',        // S02 ink black
  inkMid: '#5A5046',     // S02 ink grey (body text, rules)
  seal: '#B32B22',       // S02 seal red — the only red in the film
  celadon: '#7D9B8A',    // S02 Yue-ware celadon
  celadonLt: '#A8C0AE',  // S02 celadon highlight
  tea: '#8C6A3F',        // S02 tea ochre
  stone: '#6E6A62',      // S02 bridge stone
};

// S04 — the line each scene carries, and its tracked Latin slug.
export const COPY = {
  coord: ['北纬 30°16′', '东经 120°09′'],
  s2: {cn: '西湖', line: '一湖烟水', slug: '02 / 西湖 · WEST LAKE'},
  s3: {cn: '三潭印月', line: '月到天心', slug: '03 / 三潭印月 · THREE POOLS'},
  s4: {cn: '断桥残雪', line: '桥断，雪未断', slug: '04 / 断桥残雪 · LINGERING SNOW'},
  s5: {cn: '龙井', line: '一盏青山', slug: '05 / 龙井 · LONGJING TEA'},
  s6: {cn: '丝绸', line: '软得能接住风', slug: '06 / 丝绸 · SILK'},
  s7: {cn: '钱塘', line: '潮来，天地一线', slug: '07 / 钱塘江 · QIANTANG'},
  s8: {cn: '杭州', line: ['两千年', '一湖水'], latin: 'HANGZHOU', sub: 'ZHEJIANG · CHINA'},
};

// S01/T — scene boundaries. One boundary per bar-group; the wash turns over on each.
export const T = {
  drop: 0.95,        // the ink drop lands
  s2: 7.0, s3: 15.0, s4: 23.0, s5: 31.0, s6: 39.0, s7: 46.5, s8: 53.5,
  stamp: 55.85,      // the seal comes down
  end: 60.0,
};
export const WATER = 700;   // the lake / river waterline, px
