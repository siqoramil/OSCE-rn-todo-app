import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type LogoProps = {
  size?: number;
};

/**
 * JANGSHN brand mark — a rounded gradient badge with a stylised "J"
 * whose tail turns into a checkmark, hinting at the todo app.
 */
export function Logo({ size = 80 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="jangshnBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#818cf8" />
          <Stop offset="1" stopColor="#4f46e5" />
        </LinearGradient>
      </Defs>

      {/* Squircle background */}
      <Rect x="0" y="0" width="100" height="100" rx="26" fill="url(#jangshnBg)" />

      {/* "J" stem + hook */}
      <Path
        d="M63 26 V58 a17 17 0 0 1 -30 11"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Checkmark accent */}
      <Path
        d="M40 46 l8 8 l16 -18"
        stroke="#c7d2fe"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
