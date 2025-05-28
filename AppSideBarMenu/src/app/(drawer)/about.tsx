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
    SafeAreaView, // Importante para iOS
    ScrollView, // Para o dashboard, se necessário
} from "react-native";
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Descomente se for usar

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.35;

// 1. INTERFACE DO ABRIGO
interface Shelter {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    locality: string;
    address?: string;
    temperature?: string;
    resources: string[];
    capacity: number;
    currentOccupancy: number;
    availableSpots: number; // Será dinamicamente calculado ou atualizado
    contact?: string;
    iconName?: string;
}

// 2. DADOS FICTÍCIOS INICIAIS DOS ABRIGOS
// A lotação inicial será usada, mas os check-ins vão alterá-la em memória.
const INITIAL_MOCK_SHELTERS_DATA: Omit<Shelter, 'availableSpots'>[] = [
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
        currentOccupancy: 75, // Lotação inicial
        contact: '(11) 91234-5678',
        iconName: 'home-city',
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
    },
];

// 3. COMPONENTE PRINCIPAL
export default function ShelterApp() {
    const [currentView, setCurrentView] = useState<'mapView' | 'listView' | 'dashboardView'>('mapView');
    const [mapRegion, setMapRegion] = useState({
        latitude: -23.550520,
        longitude: -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Inicializa os abrigos com 'availableSpots' calculado
    const initializeShelters = () => {
        const initialized = INITIAL_MOCK_SHELTERS_DATA.map(s => ({
            ...s,
            availableSpots: s.capacity - s.currentOccupancy,
        }));
        setShelters(initialized);
        setLoadingData(false);
    };

    useEffect(() => {
        const requestLocationAndInitialize = async () => {
            setLoadingData(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Não é possível acessar a localização.');
            } else {
                try {
                    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setUserLocation(location.coords);
                    setMapRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.02,
                    });
                } catch (error) {
                    console.error("Erro ao obter localização: ", error);
                }
            }
            initializeShelters(); // Inicializa os abrigos após tentar pegar localização
        };
        requestLocationAndInitialize();
    }, []);


    // Função de Check-in
    const handleCheckIn = (shelterId: string) => {
        setShelters(prevShelters =>
            prevShelters.map(shelter => {
                if (shelter.id === shelterId) {
                    if (shelter.availableSpots > 0) {
                        const updatedShelter = {
                            ...shelter,
                            currentOccupancy: shelter.currentOccupancy + 1,
                            availableSpots: shelter.availableSpots - 1,
                        };
                        Alert.alert(
                            "Check-in Realizado!",
                            `Uma pessoa foi acolhida em "${updatedShelter.name}" e está segura. Lotação atual: ${updatedShelter.currentOccupancy}/${updatedShelter.capacity}.`,
                            [{ text: "OK" }]
                        );
                        return updatedShelter;
                    } else {
                        Alert.alert("Abrigo Lotado", `Não há mais vagas em "${shelter.name}".`);
                        return shelter;
                    }
                }
                return shelter;
            })
        );
    };


    // Navegação interna
    const navigateToView = (view: 'mapView' | 'listView' | 'dashboardView') => {
        if (view === 'listView' && shelters.length === 0 && !loadingData) {
            initializeShelters(); // Recarrega se a lista estiver vazia (improvável com a lógica atual)
        }
        setCurrentView(view);
    };

    // Componente Card do Abrigo
    const ShelterCard = ({ item }: { item: Shelter }) => (
        <View style={styles.card}>
            {item.iconName && <Text style={styles.cardIconPlaceholder}>{item.iconName === 'home-city' ? '🏙️' : item.iconName === 'hospital-building' ? '🏥' : item.iconName === 'nature-people' ? '🌳' : '👥'}</Text>}
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.locality}</Text>
            {item.address && <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📍</Text> {item.address}</Text>}
            <View style={styles.infoRow}>
                <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>🌡️</Text> Temp: {item.temperature || 'N/A'}</Text>
                <Text style={[styles.cardInfo, styles.availabilityInfo, item.availableSpots > 0 ? styles.spotsAvailable : styles.spotsFull]}>
                    <Text style={styles.infoEmoji}>{item.availableSpots > 0 ? '✅' : '❌'}</Text> Vagas: {item.availableSpots} ({item.currentOccupancy}/{item.capacity})
                </Text>
            </View>
            {item.resources.length > 0 && (
                <View style={styles.resourcesContainer}>
                    <Text style={styles.resourcesTitle}><Text style={styles.infoEmoji}>🛠️</Text> Recursos:</Text>
                    <View style={styles.resourceTags}>
                        {item.resources.slice(0,3).map(res => <Text key={res} style={styles.resourceTag}>{res}</Text>)}
                        {item.resources.length > 3 && <Text style={styles.resourceTag}>+ mais</Text>}
                    </View>
                </View>
            )}
            {item.contact && <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📞</Text> Contato: {item.contact}</Text>}
            {item.availableSpots > 0 && (
                <TouchableOpacity style={styles.checkInButton} onPress={() => handleCheckIn(item.id)}>
                    <Text style={styles.checkInButtonText}>FAZER CHECK-IN</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Visualização do Mapa
    const renderMapView = () => (
        <View style={styles.viewContainer}>
            <Text style={styles.headerTitle}>Localizador de Abrigos</Text>
            <Text style={styles.headerSubtitle}>Sua localização e opções de ajuda.</Text>
            <View style={styles.mapWrapper}>
                <MapView style={styles.map} region={mapRegion} showsUserLocation={true} loadingEnabled={true} />
            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.mainButton} onPress={() => navigateToView('listView')}>
                    <Text style={styles.mainButtonText}>Lista de Abrigos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mainButton, styles.secondaryButton]} onPress={() => navigateToView('dashboardView')}>
                    <Text style={styles.mainButtonText}>Lotação (Dashboard)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Visualização da Lista
    const renderListView = () => (
        <View style={styles.viewContainerFull}>
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Abrigos Disponíveis</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigateToView('mapView')}>
                    <Text style={styles.backButtonText}>⬅️ Voltar ao Mapa</Text>
                </TouchableOpacity>
            </View>
            {loadingData ? (
                <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#007AFF" /><Text>Carregando...</Text></View>
            ) : shelters.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum abrigo encontrado.</Text>
            ) : (
                <FlatList
                    data={shelters}
                    renderItem={({ item }) => <ShelterCard item={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                />
            )}
        </View>
    );

    // Visualização do Dashboard
    const renderDashboardView = () => (
        <View style={styles.viewContainerFull}>
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Dashboard de Lotação</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigateToView('mapView')}>
                    <Text style={styles.backButtonText}>⬅️ Voltar ao Mapa</Text>
                </TouchableOpacity>
            </View>
            {loadingData ? (
                 <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#007AFF" /><Text>Carregando...</Text></View>
            ) : (
                <FlatList
                    data={shelters}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    renderItem={({ item }) => (
                        <View style={styles.dashboardItem}>
                            <Text style={styles.dashboardItemName}>{item.name}</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={[
                                    styles.progressBarFill,
                                    { width: `${(item.currentOccupancy / item.capacity) * 100}%` }
                                ]} />
                            </View>
                            <Text style={styles.dashboardItemInfo}>
                                Ocupação: {item.currentOccupancy} / {item.capacity} (Vagas: {item.availableSpots})
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum abrigo para exibir.</Text>}
                />
            )}
        </View>
    );


    if (loadingData && shelters.length === 0) { // Loader inicial antes de qualquer coisa
        return (
            <SafeAreaView style={[styles.fullScreen, styles.loaderContainer]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loaderText}>Iniciando sistema de abrigos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.fullScreen}>
            {currentView === 'mapView' && renderMapView()}
            {currentView === 'listView' && renderListView()}
            {currentView === 'dashboardView' && renderDashboardView()}
        </SafeAreaView>
    );
}

// 4. ESTILOS
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#F4F7FC',
    },
    viewContainer: { // Para mapView com padding
        flex: 1,
        alignItems: 'center',
        paddingTop: 20, // Ajustado para SafeAreaView
        paddingHorizontal: 20,
    },
    viewContainerFull: { // Para listView e dashboardView
        flex: 1,
    },
    headerTitle: {
        fontSize: 24, // Reduzido um pouco
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#5A6A7A',
        marginBottom: 20, // Reduzido
        textAlign: 'center',
    },
    mapWrapper: {
        width: width * 0.9,
        height: height * MAP_HEIGHT_PERCENTAGE,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20, // Reduzido
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#DDE2E8'
    },
    map: { ...StyleSheet.absoluteFillObject },
    buttonGroup: {
        width: '90%',
    },
    mainButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14, // Reduzido
        paddingHorizontal: 20,
        borderRadius: 25, // Mais arredondado
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        marginBottom: 12, // Espaço entre botões
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: '#4CAF50', // Verde para o dashboard
    },
    mainButtonText: {
        color: '#FFFFFF',
        fontSize: 16, // Reduzido
        fontWeight: '600',
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingTop: 15, // Ajustado para SafeAreaView
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#F4F7FC', // Para consistência
    },
    backButton: { padding: 8 },
    backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, fontSize: 16, color: '#555' },
    emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#777' },
    listContentContainer: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#B0C0D0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#E8EEF5'
    },
    cardIconPlaceholder: { fontSize: 28, position: 'absolute', right: 15, top: 15, opacity: 0.7 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#34495E', marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: '#7F8C8D', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
    cardInfo: { fontSize: 15, color: '#555', marginBottom: 6, lineHeight: 22 },
    infoEmoji: { fontSize: 15 },
    availabilityInfo: { fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
    spotsAvailable: { color: '#27AE60', backgroundColor: '#E8F5E9' },
    spotsFull: { color: '#E74C3C', backgroundColor: '#FDEDED' },
    resourcesContainer: { marginTop: 8, marginBottom: 10 },
    resourcesTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 5 },
    resourceTags: { flexDirection: 'row', flexWrap: 'wrap' },
    resourceTag: { backgroundColor: '#EAECEE', color: '#5D6D7E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 6, marginBottom: 6, fontSize: 12, fontWeight: '500' },
    checkInButton: { backgroundColor: '#3498DB', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    checkInButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

    // --- Estilos do Dashboard ---
    dashboardItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    dashboardItemName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    dashboardItemInfo: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    progressBarContainer: {
        height: 20,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden', // Garante que o fill não ultrapasse as bordas
        marginTop: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50', // Verde para progresso
        borderRadius: 10, // Para cantos arredondados no fill também
    },
});