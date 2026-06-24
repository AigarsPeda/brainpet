import { Expandable } from "@/components/ui/Expandable";
import { GameColors } from "@/constants/game";
import licensesData from "@/data/licenses.json";
import { moderateScale } from "@/utils/scale";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type LicenseEntry = {
  dependency: string;
  license: string;
};

const licenses = licensesData as LicenseEntry[];
const LICENSE_BODY_MAX_HEIGHT = moderateScale(200);

function LicenseItem({ dependency, license }: LicenseEntry) {
  return (
    <Expandable
      accessibilityLabel={dependency}
      maxBodyHeight={LICENSE_BODY_MAX_HEIGHT}
      style={styles.licenseItem}
      header={<Text style={styles.licenseName}>{dependency}</Text>}
    >
      <Text style={styles.licenseText}>{license}</Text>
    </Expandable>
  );
}

type LicenseListProps = {
  style?: StyleProp<ViewStyle>;
};

export function LicenseList({ style }: LicenseListProps) {
  const { t } = useTranslation();
  const sortedLicenses = useMemo(
    () =>
      [...licenses].sort((a, b) => a.dependency.localeCompare(b.dependency)),
    [],
  );

  if (sortedLicenses.length === 0) {
    return <Text style={styles.empty}>{t("settings.licensesEmpty")}</Text>;
  }

  return (
    <FlatList
      data={sortedLicenses}
      keyExtractor={(item) => item.dependency}
      style={style}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <LicenseItem dependency={item.dependency} license={item.license} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: moderateScale(4),
    paddingBottom: moderateScale(8),
  },
  empty: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: GameColors.textMuted,
    lineHeight: moderateScale(20),
  },
  licenseItem: {
    backgroundColor: GameColors.card,
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: GameColors.cardBorder,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
  },
  licenseName: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: GameColors.text,
  },
  licenseText: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    color: GameColors.textMuted,
  },
});
