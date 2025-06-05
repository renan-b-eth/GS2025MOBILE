
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; 



const SIMULATION_INTERVAL = 3000; 
const TEMP_MIN = 18; 
const TEMP_MAX = 28; 
const HUMIDITY_MIN = 30; 
const HUMIDITY_MAX = 70; 
const CO2_MIN = 400; 
const CO2_MAX = 2000; 
const AQI_CATEGORIES = ['Boa', 'Moderada', 'Ruim', 'Muito Ruim', 'Perigosa'];
const OCCUPANCY_MAX = 50; 

interface ShelterData {
  temperatura: number;
  umidade: number;
  qualidadeAr: string; 
  nivelCO2: number;
  lotacaoAtual: number;
}


const getRandomValue = (min: number, max: number, decimals: number = 1): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};


const simulateChange = (currentValue: number, min: number, max: number, maxChange: number): number => {
  let change = (Math.random() - 0.5) * 2 * maxChange; 
  let newValue = currentValue + change;
  newValue = Math.max(min, Math.min(max, newValue)); 
  return parseFloat(newValue.toFixed(1));
};

export default function ShelterMonitorScreen() {
  const router = useRouter();
  const [shelterData, setShelterData] = useState<ShelterData>({
    temperatura: getRandomValue(TEMP_MIN, TEMP_MAX),
    umidade: getRandomValue(HUMIDITY_MIN, HUMIDITY_MAX, 0),
    qualidadeAr: AQI_CATEGORIES[Math.floor(Math.random() * AQI_CATEGORIES.length)],
    nivelCO2: getRandomValue(CO2_MIN, CO2_MAX, 0),
    lotacaoAtual: Math.floor(Math.random() * (OCCUPANCY_MAX + 1)),
  });
  const [isLoading, setIsLoading] = useState(true);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    
    const initialLoadTimer = setTimeout(() => {
        setIsLoading(false);
    }, 500);

    
    intervalIdRef.current = setInterval(() => {
      setShelterData(prevData => {
        const novaLotacao = Math.max(0, Math.min(OCCUPANCY_MAX, prevData.lotacaoAtual + Math.floor(Math.random() * 5) - 2)); // Simula entrada/saída
        let novoNivelCO2 = simulateChange(prevData.nivelCO2, CO2_MIN, CO2_MAX, 50);
        
        if (novaLotacao > prevData.lotacaoAtual) novoNivelCO2 += 20 * (novaLotacao - prevData.lotacaoAtual);
        if (novaLotacao < prevData.lotacaoAtual) novoNivelCO2 -= 10 * (prevData.lotacaoAtual - novaLotacao);
        novoNivelCO2 = Math.max(CO2_MIN, Math.min(CO2_MAX, novoNivelCO2));

        let novaQualidadeAr = prevData.qualidadeAr;
        if (novoNivelCO2 > 1500) novaQualidadeAr = AQI_CATEGORIES[3]; 
        else if (novoNivelCO2 > 1000) novaQualidadeAr = AQI_CATEGORIES[2]; 
        else if (novoNivelCO2 > 700) novaQualidadeAr = AQI_CATEGORIES[1]; 
        else novaQualidadeAr = AQI_CATEGORIES[0];

        return {
          temperatura: simulateChange(prevData.temperatura, TEMP_MIN, TEMP_MAX, 0.5),
          umidade: Math.round(simulateChange(prevData.umidade, HUMIDITY_MIN, HUMIDITY_MAX, 3)),
          qualidadeAr: novaQualidadeAr,
          nivelCO2: Math.round(novoNivelCO2),
          lotacaoAtual: novaLotacao,
        };
      });
    }, SIMULATION_INTERVAL);

    return () => {
      clearTimeout(initialLoadTimer);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  const getQualityAirColor = (quality: string) => {
    if (quality === 'Boa') return '#2ECC71'; 
    if (quality === 'Moderada') return '#F1C40F'; 
    if (quality === 'Ruim') return '#E67E22'; 
    if (quality === 'Muito Ruim') return '#E74C3C'; 
    if (quality === 'Perigosa') return '#9B59B6'; 
    return '#7F8C8D'; 
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando Simulador...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Monitor do Abrigo (Simulação)</Text>

        <View style={styles.gridContainer}>
          <View style={[styles.dataCard, styles.largeCard]}>
            {}
            <Text style={styles.iconEmoji}>🌡️</Text>
            <Text style={styles.dataLabel}>Temperatura</Text>
            <Text style={[styles.dataValue, { color: shelterData.temperatura > 25 ? '#E74C3C' : shelterData.temperatura < 20 ? '#3498DB' : '#2C3E50' }]}>
              {shelterData.temperatura.toFixed(1)} °C
            </Text>
          </View>

          <View style={[styles.dataCard, styles.largeCard]}>
            {}
            <Text style={styles.iconEmoji}>💧</Text>
            <Text style={styles.dataLabel}>Umidade</Text>
            <Text style={styles.dataValue}>{shelterData.umidade} %</Text>
          </View>

          <View style={[styles.dataCard, styles.fullWidthCard]}>
            {}
            <Text style={styles.iconEmoji}>🌬️</Text>
            <Text style={styles.dataLabel}>Qualidade do Ar</Text>
            <Text style={[styles.dataValue, { color: getQualityAirColor(shelterData.qualidadeAr) }]}>
              {shelterData.qualidadeAr}
            </Text>
          </View>

          <View style={styles.dataCard}>
            {}
            <Text style={styles.iconEmoji}>💨</Text>
            <Text style={styles.dataLabel}>Nível de CO₂</Text>
            <Text style={styles.dataValue}>{shelterData.nivelCO2} ppm</Text>
          </View>

          <View style={styles.dataCard}>
            {}
            <Text style={styles.iconEmoji}>👥</Text>
            <Text style={styles.dataLabel}>Lotação</Text>
            <Text style={styles.dataValue}>{shelterData.lotacaoAtual} / {OCCUPANCY_MAX}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButtonMain}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/delivered')} 
        >
          <Text style={styles.backButtonTextMain}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 25,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%', 
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#B0C0D0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  largeCard: {
    
  },
  fullWidthCard: {
    width: '100%', 
  },
  iconEmoji: {
    fontSize: 32, 
    marginBottom: 8,
  },
 
  dataLabel: {
    fontSize: 14,
    color: '#5A6A7A',
    marginBottom: 5,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  backButtonMain: {
    marginTop: 30,
    backgroundColor: '#6C757D', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
  },
  backButtonTextMain: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});