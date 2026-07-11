import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Você esquece de beber água?',
    subtitle: '75% das pessoas não bebem a quantidade ideal de água todos os dias.',
    icon: '💧',
  },
  {
    title: 'Hidratação muda tudo',
    subtitle: 'Melhora sua disposição, memória, concentração e até o humor.',
    icon: '✨',
  },
  {
    title: 'Meta personalizada',
    subtitle: 'Baseada no seu peso, idade, clima, atividade e condições de saúde.',
    icon: '🎯',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.replace('/register');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        key={current}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.content}
      >
        <Text style={styles.icon}>{slides[current].icon}</Text>
        <Text style={styles.title}>{slides[current].title}</Text>
        <Text style={styles.subtitle}>{slides[current].subtitle}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>
            {current < slides.length - 1 ? 'Continuar' : 'Começar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#042f4e', paddingHorizontal: 24, paddingTop: 80 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#76a7c3', textAlign: 'center', lineHeight: 24 },
  footer: { paddingBottom: 48 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1f2c38' },
  dotActive: { width: 32, backgroundColor: '#53b0ff' },
  button: {
    backgroundColor: '#0088d4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
