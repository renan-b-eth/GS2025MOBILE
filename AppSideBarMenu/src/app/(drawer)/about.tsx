import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Dimensions,
    FlatList,
    ActivityIndicator,
    ScrollView, // Usaremos ScrollView se a lista for pequena ou para o layout geral
    SafeAreaView,
} from "react-native";
import MapView from 'react-native-maps'; // Instale: npx expo install react-native-maps
import * as Location from 'expo-location'; // Instale: npx expo install expo-location
// Para ícones, você pode instalar e usar: npx expo install @expo/vector-icons
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.35; // 35% da altura da tela para o mapa

// 1. INTERFACE DO ABRIGO
interface Shelter {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    locality: string;
    address?: string; // Endereço mais detalhado
    temperature?: string;
    resources: string[]; // Lista de recursos principais
    capacity: number;
    currentOccupancy: number;
    availableSpots: number;
    contact?: string; // Telefone ou email
    iconName?: string; // Para um ícone representativo (ex: 'home-outline')
}

// 2. DADOS FICTÍCIOS DOS ABRIGOS
const MOCK_SHELTERS_DATA: Shelter[] = [
    {
        id: 'shelter1',
        name: 'Abrigo Central Esperança',
        latitude: -23.550520,
        longitude: -46.633308,
        locality: 'Centro Histórico',
        address: 'Rua da Consolação, 101, São Paulo, SP',
        temperature: '20°C',
        resources: ['Água', 'Alimentação Quente', 'Cobertores', 'Kit Higiene'],
        capacity: 100,
        currentOccupancy: 75,
        contact: '(11) 91234-5678',
        iconName: 'home-city',
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter2',
        name: 'Refúgio Bem-Estar Norte',
        latitude: -23.540000,
        longitude: -46.640000,
        locality: 'Zona Norte',
        address: 'Av. Cruzeiro do Sul, 2020, São Paulo, SP',
        temperature: '19°C',
        resources: ['Alojamento', 'Suporte Médico Básico', 'Roupas'],
        capacity: 50,
        currentOccupancy: 48,
        contact: 'bemestar.norte@example.com',
        iconName: 'hospital-building',
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter3',
        name: 'Ponto de Apoio Sul',
        latitude: -23.561318,
        longitude: -46.656189,
        locality: 'Zona Sul',
        address: 'Rua Vergueiro, 3030, São Paulo, SP',
        temperature: '21°C',
        resources: ['Água', 'Lanches Rápidos', 'Apoio Psicológico'],
        capacity: 30,
        currentOccupancy: 30,
        iconName: 'nature-people',
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter4',
        name: 'Casa de Acolhimento Leste',
        latitude: -23.545000,
        longitude: -46.500000,
        locality: 'Zona Leste',
        address: 'Av. Radial Leste, 4040, São Paulo, SP',
        temperature: '20°C',
        resources: ['Alimentação', 'Área para crianças', 'Wi-Fi'],
        capacity: 70,
        currentOccupancy: 30,
        contact: '(11) 98765-4321',
        iconName: 'account-group',
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
];

// 3. COMPONENTE PRINCIPAL
export default function About() {
    const [currentView, setCurrentView] = useState<'mapView' | 'listView'>('mapView');
    const [mapRegion, setMapRegion] = useState({
        latitude: -23.550520, // São Paulo Padrão
        longitude: -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loadingShelters, setLoadingShelters] = useState(true);

    // Efeito para buscar localização do usuário
    useEffect(() => {
        const requestLocationAndFetchShelters = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Não é possível acessar a localização.');
                // Se a permissão for negada, carregamos os abrigos mesmo assim
                fetchAvailableShelters();
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setUserLocation(location.coords);
                setMapRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.03, // Zoom maior
                    longitudeDelta: 0.02,
                });
            } catch (error) {
                console.error("Erro ao obter localização: ", error);
                Alert.alert("Erro de Localização", "Não foi possível obter sua localização atual.")
            } finally {
                // Carrega os abrigos independentemente do sucesso da localização
                fetchAvailableShelters();
            }
        };
        requestLocationAndFetchShelters();
    }, []);

    // Função para simular busca de abrigos
    const fetchAvailableShelters = () => {
        setLoadingShelters(true);
        console.log("Buscando abrigos (simulação)...");
        setTimeout(() => {
            setShelters(MOCK_SHELTERS_DATA.map(s => ({...s, availableSpots: s.capacity - s.currentOccupancy})));
            setLoadingShelters(false);
        }, 1000);
    };

    // Funções para navegação interna
    const navigateToListView = () => {
        // Se os abrigos ainda não foram carregados, carrega-os antes de mudar de tela
        if (shelters.length === 0 && !loadingShelters) {
            fetchAvailableShelters();
        }
        setCurrentView('listView');
    };
    const navigateToMapView = () => setCurrentView('mapView');

    // Componente para renderizar um card de abrigo na lista
    const ShelterCard = ({ item }: { item: Shelter }) => (
        <View style={styles.card}>
            {/* Ícone (simulado) - substitua por <Ionicons name={item.iconName} size={24} color="#007AFF" /> se usar expo-vector-icons */}
            {item.iconName && <Text style={styles.cardIconPlaceholder}>{item.iconName === 'home-city' ? '🏙️' : item.iconName === 'hospital-building' ? '🏥' : item.iconName === 'nature-people' ? '🌳' : '👥'}</Text>}
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.locality}</Text>
            {item.address && <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📍</Text> {item.address}</Text>}
            
            <View style={styles.infoRow}>
                <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>🌡️</Text> Temp: {item.temperature || 'N/A'}</Text>
                <Text style={[
                        styles.cardInfo,
                        styles.availabilityInfo,
                        item.availableSpots > 0 ? styles.spotsAvailable : styles.spotsFull
                    ]}>
                    <Text style={styles.infoEmoji}>{item.availableSpots > 0 ? '✅' : '❌'}</Text> Vagas: {item.availableSpots} ({item.currentOccupancy}/{item.capacity})
                </Text>
            </View>

            {item.resources.length > 0 && (
                <View style={styles.resourcesContainer}>
                    <Text style={styles.resourcesTitle}><Text style={styles.infoEmoji}>🛠️</Text> Recursos:</Text>
                    <View style={styles.resourceTags}>
                        {item.resources.slice(0, 3).map(resource => ( // Mostra até 3 recursos
                            <Text key={resource} style={styles.resourceTag}>{resource}</Text>
                        ))}
                        {item.resources.length > 3 && <Text style={styles.resourceTag}>+ mais</Text>}
                    </View>
                </View>
            )}

            {item.contact && <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📞</Text> Contato: {item.contact}</Text>}

            {/* Botão de Check-in (exemplo) */}
            {item.availableSpots > 0 && (
                <TouchableOpacity style={styles.checkInButton} onPress={() => Alert.alert("Check-in", `Simular check-in para ${item.name}`)}>
                    <Text style={styles.checkInButtonText}>FAZER CHECK-IN</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Renderiza a Visualização do Mapa
    const renderMapView = () => (
        <View style={styles.mapViewContainer}>
            <Text style={styles.headerTitle}>Localizador de Abrigos</Text>
            <Text style={styles.headerSubtitle}>Veja sua localização e encontre abrigos próximos.</Text>
            <View style={styles.mapWrapper}>
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                    loadingEnabled={true}
                />
            </View>
            <TouchableOpacity style={styles.mainButton} onPress={navigateToListView}>
                <Text style={styles.mainButtonText}>Visualizar Abrigos Disponíveis</Text>
            </TouchableOpacity>
        </View>
    );

    // Renderiza a Visualização da Lista
    const renderListView = () => (
        <View style={styles.listViewContainer}>
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Abrigos Disponíveis</Text>
                <TouchableOpacity style={styles.backButton} onPress={navigateToMapView}>
                    {/* <Ionicons name="arrow-back-circle" size={32} color="#007AFF" /> */}
                    <Text style={styles.backButtonText}>⬅️ Voltar ao Mapa</Text>
                </TouchableOpacity>
            </View>

            {loadingShelters ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loaderText}>Carregando abrigos...</Text>
                </View>
            ) : shelters.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum abrigo encontrado no momento.</Text>
            ) : (
                <FlatList
                    data={shelters}
                    renderItem={({ item }) => <ShelterCard item={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );

    // Renderização Principal
    return (
        <SafeAreaView style={styles.fullScreen}>
            {currentView === 'mapView' ? renderMapView() : renderListView()}
        </SafeAreaView>
    );
}

// 4. ESTILOS
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#F4F7FC', // Um azul bem claro para o fundo geral
    },
    // --- Estilos da Visualização do Mapa ---
    mapViewContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2C3E50', // Azul escuro
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#5A6A7A', // Cinza azulado
        marginBottom: 25,
        textAlign: 'center',
    },
    mapWrapper: {
        width: width * 0.9,
        height: height * MAP_HEIGHT_PERCENTAGE,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 30,
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#DDE2E8'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mainButton: {
        backgroundColor: '#007AFF', // Azul vibrante
        paddingVertical: 16,
        paddingHorizontal: 35,
        borderRadius: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    mainButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600', // Semibold
    },

    // --- Estilos da Visualização da Lista ---
    listViewContainer: {
        flex: 1,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
        color: '#777',
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20, // Espaço no final da lista
    },

    // --- Estilos do Card de Abrigo ---
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#B0C0D0', // Sombra mais suave
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#E8EEF5'
    },
    cardIconPlaceholder: { // Se não usar expo-vector-icons
        fontSize: 28,
        position: 'absolute',
        right: 15,
        top: 15,
        opacity: 0.7,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#34495E', // Azul petróleo
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#7F8C8D', // Cinza claro
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap', // Para quebrar linha se não couber
    },
    cardInfo: {
        fontSize: 15,
        color: '#555',
        marginBottom: 6,
        lineHeight: 22,
    },
    infoEmoji: {
        fontSize: 15, // Para emojis terem tamanho similar ao texto
    },
    availabilityInfo: {
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
    },
    spotsAvailable: {
        color: '#27AE60', // Verde
        backgroundColor: '#E8F5E9',
    },
    spotsFull: {
        color: '#E74C3C', // Vermelho
        backgroundColor: '#FDEDED',
    },
    resourcesContainer: {
        marginTop: 8,
        marginBottom: 10,
    },
    resourcesTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    resourceTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    resourceTag: {
        backgroundColor: '#EAECEE', // Cinza bem claro
        color: '#5D6D7E',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 6,
        marginBottom: 6,
        fontSize: 12,
        fontWeight: '500',
    },
    checkInButton: {
        backgroundColor: '#3498DB', // Azul um pouco mais claro
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    checkInButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});