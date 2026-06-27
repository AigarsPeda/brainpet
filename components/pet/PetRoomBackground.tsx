import { getCatRoomSource } from "@/constants/cat-rooms";
import { Image, StyleSheet, View } from "react-native";

type PetRoomBackgroundProps = {
  roomId?: string;
};

export function PetRoomBackground({ roomId }: PetRoomBackgroundProps) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={getCatRoomSource(roomId)}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#E8D8C8",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
