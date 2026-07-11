import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SplashScreen() {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
    opacity.value = withDelay(500, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 220 * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={120} height={120} viewBox="0 0 100 100">
        <AnimatedPath
          d="M50 5 C50 5, 85 40, 85 65 C85 85, 70 95, 50 95 C30 95, 15 85, 15 65 C15 40, 50 5, 50 5Z"
          fill="none"
          stroke="#53b0ff"
          strokeWidth={2}
          strokeDasharray={220}
          animatedProps={animatedProps}
        />
      </Svg>

      <Animated.Text style={[styles.title, { opacity: opacity.value }]}>
        Hydra AI
      </Animated.Text>
      <Text style={styles.subtitle}>Sua saúde começa com um gole.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#042f4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#53b0ff',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#76a7c3',
    marginTop: 8,
  },
});
