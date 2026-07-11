import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Vibration } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedProps,
  interpolateColor,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.65;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DashboardScreen() {
  const [totalMl, setTotalMl] = useState(0);
  const [metaMl, setMetaMl] = useState(2600);
  const [animating, setAnimating] = useState(false);

  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const waterY = useSharedValue(100);

  const percent = metaMl > 0 ? Math.min((totalMl / metaMl) * 100, 100) : 0;

  useEffect(() => {
    progress.value = withTiming(percent / 100, { duration: 1000 });
  }, [percent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const handleDrink = useCallback(async () => {
    if (animating) return;
    setAnimating(true);
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    waterY.value = withTiming(0, { duration: 600 }, () => {
      waterY.value = withTiming(100, { duration: 400 });
    });

    Vibration.vibrate(50);
    setTotalMl(prev => prev + 200);
    setTimeout(() => setAnimating(false), 1000);
  }, [animating]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá</Text>
        <Text style={styles.name}>Jane</Text>
      </View>

      <View style={styles.circleContainer}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#53b0ff"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            fill="none"
            animatedProps={animatedProps}
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.litersText}>{(totalMl / 1000).toFixed(1)}</Text>
          <Text style={styles.unitText}>L</Text>
          <Text style={styles.metaText}>Meta {(metaMl / 1000).toFixed(1)} L</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.drinkButton, animating && styles.drinkButtonPressed]}
        onPress={handleDrink}
        activeOpacity={0.8}
      >
        <Text style={styles.drinkIcon}>💧</Text>
        <Text style={styles.drinkText}>Bebi Água</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <StatBox icon="⚡" label="Hoje" value={`${totalMl}ml`} />
        <StatBox icon="🎯" label="Meta" value={`${metaMl}ml`} />
        <StatBox icon="📊" label="Progresso" value={`${Math.round(percent)}%`} />
      </View>
    </View>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#042f4e',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  greeting: { fontSize: 14, color: '#76a7c3' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  circleContainer: { alignItems: 'center', marginBottom: 32 },
  centerText: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0 },
  litersText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  unitText: { fontSize: 18, color: '#76a7c3' },
  metaText: { fontSize: 14, color: '#53b0ff', marginTop: 4 },
  drinkButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0088d4',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#0088d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 32,
  },
  drinkButtonPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  drinkIcon: { fontSize: 32, marginBottom: 4 },
  drinkText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
  },
  statIcon: { fontSize: 24 },
  statLabel: { fontSize: 12, color: '#76a7c3', marginTop: 4 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 2 },
});
