import React, { ReactNode, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeableRow({ children, onSwipeLeft, onSwipeRight, threshold = 80 }: Props) {
  const translateX = useSharedValue(0);

  const handleLeft = useCallback(() => { onSwipeLeft?.(); }, [onSwipeLeft]);
  const handleRight = useCallback(() => { onSwipeRight?.(); }, [onSwipeRight]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      translateX.value = Math.max(-140, Math.min(140, e.translationX));
    })
    .onEnd(e => {
      if (e.translationX > threshold && onSwipeRight) {
        translateX.value = withTiming(0);
        runOnJS(handleRight)();
      } else if (e.translationX < -threshold && onSwipeLeft) {
        translateX.value = withTiming(0);
        runOnJS(handleLeft)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
