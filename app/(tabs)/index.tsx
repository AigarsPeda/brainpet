import { useEffect, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Each PNG is a sprite sheet: 1536×1024 with a 2×2 grid → 768×512 per frame
const SHEET_COLS = 2;
const SHEET_ROWS = 2;
const FRAME_COUNT = SHEET_COLS * SHEET_ROWS;
const SHEET_W = 1536;
const SHEET_H = 1024;
const FRAME_W = SHEET_W / SHEET_COLS; // 768
const FRAME_H = SHEET_H / SHEET_ROWS; // 512

// The updated 2×2 sheets place the dog inside a shorter frame,
// so we crop a tighter vertical window around the visible pose.
const CROP_TOP_ORIG = 24;
const CROP_H_ORIG = 440;

// Base display size: frame rendered at this width, crop scaled proportionally
const BASE_W = 150;

type FocusPoint = {
  x: number;
  y: number;
};

type SpriteConfig = {
  name: string;
  src: ImageSourcePropType;
  focusFrames: FocusPoint[];
};

const DEFAULT_FOCUS: FocusPoint = {
  x: FRAME_W / 2,
  y: CROP_TOP_ORIG + CROP_H_ORIG / 2,
};

const SPRITES = [
  {
    name: "idle",
    src: require("@/images/idle.png"),
    focusFrames: [
      { x: 546, y: 299 },
      { x: 245, y: 299 },
      { x: 538, y: 187 },
      { x: 245, y: 187 },
    ],
  },
  {
    name: "excited",
    src: require("@/images/excited.png"),
    focusFrames: [
      { x: 537, y: 284 },
      { x: 254, y: 279 },
      { x: 532, y: 197 },
      { x: 264, y: 198 },
    ],
  },
  {
    name: "dancing",
    src: require("@/images/dancing.png"),
    focusFrames: [
      { x: 504, y: 319 },
      { x: 237, y: 319 },
      { x: 523, y: 185 },
      { x: 253, y: 188 },
    ],
  },
  {
    name: "eating",
    src: require("@/images/eating.png"),
    focusFrames: [
      { x: 491, y: 322 },
      { x: 266, y: 344 },
      { x: 505, y: 191 },
      { x: 247, y: 169 },
    ],
  },
  {
    name: "angry",
    src: require("@/images/angry.png"),
    focusFrames: [
      { x: 506, y: 288 },
      { x: 257, y: 289 },
      { x: 525, y: 210 },
      { x: 254, y: 207 },
    ],
  },
  {
    name: "sad",
    src: require("@/images/sad.png"),
    focusFrames: [
      { x: 521, y: 300 },
      { x: 255, y: 288 },
      { x: 526, y: 215 },
      { x: 260, y: 209 },
    ],
  },
  {
    name: "sleeping",
    src: require("@/images/sleeping.png"),
    focusFrames: [
      { x: 522, y: 264 },
      { x: 286, y: 266 },
      { x: 546, y: 199 },
      { x: 274, y: 199 },
    ],
  },
] satisfies SpriteConfig[];

const SPEEDS = [
  { label: "Slow", ms: 600 },
  { label: "Normal", ms: 400 },
  { label: "Fast", ms: 80 },
];

/** Renders one frame from a sprite sheet with proper absolute-position clipping. */
function SpriteFrame({
  src,
  frame,
  width = BASE_W,
  focusFrames,
}: {
  src: ImageSourcePropType;
  frame: number;
  width?: number;
  focusFrames?: FocusPoint[];
}) {
  const scale = width / FRAME_W;
  const totalW = Math.round(SHEET_W * scale);
  const totalH = Math.round(SHEET_H * scale);
  const cropTop = Math.round(CROP_TOP_ORIG * scale);
  const cropH = Math.round(CROP_H_ORIG * scale);
  const frameCol = frame % SHEET_COLS;
  const frameRow = Math.floor(frame / SHEET_COLS);
  const offsetX = -Math.round(frameCol * width);
  const offsetY = -Math.round(frameRow * FRAME_H * scale) - cropTop;
  const focus = focusFrames?.[frame] ?? DEFAULT_FOCUS;
  const focusYInCrop = (focus.y - CROP_TOP_ORIG) * scale;
  const frameShiftX = Math.round((FRAME_W / 2 - focus.x) * scale);
  const frameShiftY = Math.round(cropH / 2 - focusYInCrop);

  return (
    <View style={[styles.spriteViewport, { width, height: cropH }]}>
      <View
        style={[
          styles.spriteFrameClip,
          {
            width,
            height: cropH,
            left: frameShiftX,
            top: frameShiftY,
          },
        ]}
      >
        <Image
          source={src}
          style={{
            position: "absolute",
            width: totalW,
            height: totalH,
            left: offsetX,
            top: offsetY,
          }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [spriteIndex, setSpriteIndex] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setFrame((f) => (f + 1) % FRAME_COUNT);
      }, SPEEDS[speedIndex].ms);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speedIndex]);

  const current = SPRITES[spriteIndex];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sprite Preview</Text>

      {/* Main animation viewer */}
      <View style={styles.stage}>
        <SpriteFrame
          src={current.src}
          frame={frame}
          width={BASE_W}
          focusFrames={current.focusFrames}
        />
        <Text style={styles.stateName}>
          {current.name} • frame {frame + 1}/{FRAME_COUNT}
        </Text>
      </View>

      {/* Speed + play controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => setPlaying((p) => !p)}
        >
          <Text style={styles.btnText}>{playing ? "⏸ Pause" : "▶ Play"}</Text>
        </Pressable>
        {SPEEDS.map((s, i) => (
          <Pressable
            key={s.label}
            style={[styles.btn, i === speedIndex && styles.btnActive]}
            onPress={() => setSpeedIndex(i)}
          >
            <Text
              style={[styles.btnText, i === speedIndex && styles.btnTextActive]}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sprite selector strip */}
      <View style={styles.strip}>
        {SPRITES.map((sprite, i) => (
          <Pressable
            key={sprite.name}
            onPress={() => {
              setSpriteIndex(i);
              setFrame(0);
            }}
            style={[styles.thumb, i === spriteIndex && styles.thumbActive]}
          >
            <View style={styles.thumbPreview}>
              <SpriteFrame
                src={sprite.src}
                frame={0}
                width={56}
                focusFrames={sprite.focusFrames}
              />
            </View>
            <Text style={styles.thumbLabel}>{sprite.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  spriteViewport: {
    overflow: "hidden",
  },
  spriteFrameClip: {
    position: "absolute",
    overflow: "hidden",
  },
  container: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
    gap: 24,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
  },
  stage: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e94560",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  stateName: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 1,
  },
  controls: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#16213e",
    borderWidth: 1,
    borderColor: "#444",
  },
  btnPrimary: {
    borderColor: "#e94560",
  },
  btnActive: {
    backgroundColor: "#e94560",
    borderColor: "#e94560",
  },
  btnText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  btnTextActive: {
    color: "#fff",
  },
  strip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  thumb: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
    width: 80,
    minHeight: 116,
  },
  thumbPreview: {
    width: "100%",
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbActive: {
    borderColor: "#e94560",
  },
  thumbLabel: {
    color: "#ccc",
    fontSize: 10,
    textTransform: "capitalize",
  },
});
