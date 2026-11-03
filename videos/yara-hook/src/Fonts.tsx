import { staticFile } from 'remotion';

const faces = `
@font-face { font-family: "Plex Arabic"; font-weight: 400; src: url(${staticFile('fonts/PlexArabic-Regular.ttf')}) format("truetype"); }
@font-face { font-family: "Plex Arabic"; font-weight: 500; src: url(${staticFile('fonts/PlexArabic-Medium.ttf')}) format("truetype"); }
@font-face { font-family: "Plex Arabic"; font-weight: 700; src: url(${staticFile('fonts/PlexArabic-Bold.ttf')}) format("truetype"); }
@font-face { font-family: "Reem Kufi"; font-weight: 400 700; src: url(${staticFile('fonts/ReemKufi.ttf')}) format("truetype"); }
`;

export const Fonts = () => <style>{faces}</style>;
