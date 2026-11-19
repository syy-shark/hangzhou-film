import {Config} from '@remotion/cli/config';

// 10 核机器，Alma 常驻。4 路并发是实测甜点：再高 Chrome 之间互相抢 CPU 反而更慢。
Config.setConcurrency(4);
// 'angle' 走 Metal 硬件加速；'swangle' 是纯软件光栅化，SVG 滤镜（feTurbulence /
// feDisplacementMap）全靠 CPU 算，一帧要十几秒。这里有大量噪声滤镜，必须用硬件。
Config.setChromiumOpenGlRenderer('angle');
