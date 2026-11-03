import { Config } from '@remotion/cli/config';

Config.setBrowserExecutable('/opt/pw-browsers/chromium-1243/chrome-linux64/chrome');
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(14);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
