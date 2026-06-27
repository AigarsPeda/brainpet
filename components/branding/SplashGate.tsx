import {
  AnimatedSplashCat,
  SplashBackdrop,
} from "@/components/branding/AnimatedSplashCat";
import { useGame } from "@/contexts/GameProvider";
import * as SplashScreen from "expo-splash-screen";
import { type ReactNode, useLayoutEffect, useState } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 900;

type SplashGateProps = {
  children: ReactNode;
};

export function SplashGate({ children }: SplashGateProps) {
  const { isReady } = useGame();
  const [showOverlay, setShowOverlay] = useState(true);

  useLayoutEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useLayoutEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, MIN_SPLASH_MS);

    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <>
      {children}
      {showOverlay ? (
        <SplashBackdrop>
          <AnimatedSplashCat />
        </SplashBackdrop>
      ) : null}
    </>
  );
}
