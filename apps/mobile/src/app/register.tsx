import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '',
    idade: '', peso: '', altura: '', cidade: '',
    atividade_fisica: 'SEDENTARIO',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, idade: parseInt(form.idade), peso: parseFloat(form.peso), altura: parseFloat(form.altura) }),
      });
      if (res.ok) {
        router.replace('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressBar}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.progressStep, i <= step && styles.progressActive]} />
        ))}
      </View>

      <Text style={styles.title}>
        {step === 1 ? 'Dados básicos' : step === 2 ? 'Dados físicos' : 'Condições de saúde'}
      </Text>

      {step === 1 && (
        <>
          <Input label="Nome" value={form.nome} onChange={(v) => handleChange('nome', v)} />
          <Input label="Email" value={form.email} onChange={(v) => handleChange('email', v)} keyboardType="email-address" />
          <Input label="Senha" value={form.senha} onChange={(v) => handleChange('senha', v)} secureTextEntry />
          <Input label="Idade" value={form.idade} onChange={(v) => handleChange('idade', v)} keyboardType="numeric" />
        </>
      )}

      {step === 2 && (
        <>
          <Input label="Peso (kg)" value={form.peso} onChange={(v) => handleChange('peso', v)} keyboardType="numeric" />
          <Input label="Altura (cm)" value={form.altura} onChange={(v) => handleChange('altura', v)} keyboardType="numeric" />
          <Input label="Cidade" value={form.cidade} onChange={(v) => handleChange('cidade', v)} />
        </>
      )}

      {step === 3 && (
        <Text style={styles.infoText}>
          Configure suas condições de saúde no perfil depois do cadastro.
        </Text>
      )}

      <View style={styles.buttons}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.disabled]}
          onPress={step < 3 ? () => setStep(step + 1) : handleSubmit}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Carregando...' : step < 3 ? 'Próximo' : 'Criar conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Input({ label, value, onChange, ...props }: any) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#437191"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#042f4e' },
  content: { padding: 24, paddingTop: 60 },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#1f2c38' },
  progressActive: { backgroundColor: '#53b0ff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#76a7c3', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  infoText: { fontSize: 16, color: '#76a7c3', lineHeight: 24, textAlign: 'center', marginTop: 20 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 32 },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0088d4',
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
