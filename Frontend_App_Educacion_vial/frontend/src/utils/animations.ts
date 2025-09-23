import { Animated } from 'react-native';

export const animations = {
  fadeIn: (value: Animated.Value, duration = 1000) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });
  },
  fadeOut: (value: Animated.Value, duration = 1000) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    });
  },
  scale: (value: Animated.Value, toValue = 1.1, duration = 500) => {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
    });
  },
  rotate: (value: Animated.Value, toValue = 360, duration = 1000) => {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
    });
  },
  bounce: (value: Animated.Value, toValue = 1.2, duration = 300) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]);
  },
  pulse: (value: Animated.Value, duration = 1000) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
  },
};
