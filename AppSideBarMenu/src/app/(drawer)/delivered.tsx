import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert } from "react-native";
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

// Define a interface para um Abrigo
interface Shelter {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    temperature?: string; // Ex: "22°C"
    resources: string[];   // Ex: ["água", "comida", "cobertores"]
    capacity: number;
    currentOccupancy: number;
    availableSpots: number; // Calculado: capacity - currentOccupancy
}

// Dados fictícios de abrigos (em um app real, viriam de uma API)
const MOCK_SHELTERS: Shelter[] = [
    {
        id: 'shelter1',
        name: 'Abrigo Central Esperança',
        latitude: -23.550520, // Coordenadas de exemplo (São Paulo)
        longitude: -46.633308,
        temperature: '20°C',
        resources: ['Água potável', 'Alimentação', 'Kit higiene', 'Cobertores'],
        capacity: 100,
        currentOccupancy: 75,
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter2',
        name: 'Refúgio Bem-Estar Norte',
        latitude: -23.540000,
        longitude: -46.640000,
        temperature: '19°C',
        resources: ['Alojamento', 'Suporte médico básico'],
        capacity: 50,
        currentOccupancy: 48,
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter3',
        name: 'Ponto de Apoio Sul',
        latitude: -23.561318,
        longitude: -46.656189,
        // temperature: undefined, // Exemplo de dado ausente
        resources: ['Água', 'Lanches rápidos'],
        capacity: 30,
        currentOccupancy: 30, // Exemplo de abrigo lotado
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
];

export default function ShelterMapScreen() {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
    const [isShelterModalVisible, setIsShelterModalVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: -23.550520, // Região inicial (São Paulo)
        longitude: -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [loadingShelters, setLoadingShelters] = useState(false);

    // Função para solicitar permissão e obter a localização do usuário
    const getUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'Não é possível acessar a localização para encontrar abrigos próximos.');
            // Define uma localização padrão caso a permissão seja negada, para o mapa funcionar.
            setMapRegion({
                latitude: -23.550520, // São Paulo como padrão
                longitude: -46.633308,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
            setMapRegion(prevRegion => ({
                ...prevRegion,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }));
        } catch (error) {
            console.error("Erro ao obter localização: ", error);
            Alert.alert("Erro de Localização", "Não foi possível obter sua localização atual.")
        }
    };

    // Simula a busca por abrigos
    const findAvailableShelters = async () => {
        setLoadingShelters(true);
        console.log("Procurando abrigos...");
        // Em um app real, você faria uma chamada a uma API aqui
        // Poderia filtrar por proximidade usando userLocation
        setTimeout(() => {
            // Filtra apenas abrigos com vagas
            const available = MOCK_SHELTERS.map(s => ({...s, availableSpots: s.capacity - s.currentOccupancy}));
            setShelters(available);
            setLoadingShelters(false);
            if (available.filter(s => s.availableSpots > 0).length === 0) {
                Alert.alert("Nenhum Abrigo", "Nenhum abrigo com vagas encontrado no momento.");
            } else if (available.length > 0 && mapRegion.latitude === -23.550520) { // Se não pegou localização do usuário
                 // Centraliza no primeiro abrigo encontrado se a localização do usuário não estiver disponível
                setMapRegion(prev => ({
                    ...prev,
                    latitude: available[0].latitude,
                    longitude: available[0].longitude,
                }));
            }
        }, 1500); // Simula delay de rede
    };

    useEffect(() => {
        getUserLocation();
        // findAvailableShelters(); // Pode chamar aqui para carregar abrigos inicialmente
    }, []);

    const handleMarkerPress = (shelter: Shelter) => {
        setSelectedShelter(shelter);
        setIsShelterModalVisible(true);
    };

    const handleCheckIn = () => {
        if (selectedShelter) {
            // Lógica de Check-in:
            // 1. Verificar se ainda há vagas (importante em um sistema real com concorrência)
            // 2. Enviar uma requisição para o backend para registrar o check-in.
            // 3. Atualizar a lotação localmente (ou buscar dados atualizados).

            if (selectedShelter.availableSpots <= 0) {
                Alert.alert("Abrigo Lotado", "Não há mais vagas neste abrigo.");
                return;
            }

            Alert.alert(
                "Check-in Realizado",
                `Você fez check-in no ${selectedShelter.name}. Siga as instruções no local.`,
                [{ text: "OK", onPress: () => {
                    setIsShelterModalVisible(false);
                    // Simular atualização da lotação
                    const updatedShelters = shelters.map(s =>
                        s.id === selectedShelter.id
                            ? { ...s, currentOccupancy: s.currentOccupancy + 1, availableSpots: s.availableSpots - 1 }
                            : s
                    );
                    setShelters(updatedShelters);
                    setSelectedShelter(null);
                }}]
            );
        }
    };

    const renderShelterDetailsModal = () => {
        if (!selectedShelter) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isShelterModalVisible}
                onRequestClose={() => {
                    setIsShelterModalVisible(false);
                    setSelectedShelter(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedShelter.name}</Text>
                        <Text style={styles.modalText}>
                            Temperatura: {selectedShelter.temperature || 'Não informada'}
                        </Text>
                        <Text style={styles.modalText}>
                            Lotação: {selectedShelter.currentOccupancy} / {selectedShelter.capacity}
                        </Text>
                        <Text style={styles.modalTextBold}>
                            Vagas disponíveis: {selectedShelter.availableSpots}
                        </Text>
                        <Text style={styles.modalText}>
                            Recursos: {selectedShelter.resources.join(', ') || 'Não informados'}
                        </Text>

                        <View style={styles.modalButtonContainer}>
                           {selectedShelter.availableSpots > 0 ? (
                                <TouchableOpacity style={[styles.button, styles.checkInButton]} onPress={handleCheckIn}>
                                    <Text style={styles.buttonText}>Fazer Check-in</Text>
                                </TouchableOpacity>
                           ) : (
                                <Text style={styles.fullText}>Este abrigo está lotado.</Text>
                           )}
                            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setIsShelterModalVisible(false)}>
                                <Text style={styles.buttonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                // showsMyLocationButton={true} // Pode precisar de configuração adicional
            >
                {shelters.map(shelter => (
                    <Marker
                        key={shelter.id}
                        coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
                        title={shelter.name}
                        description={`Vagas: ${shelter.availableSpots}`}
                        pinColor={shelter.availableSpots > 0 ? "green" : "red"}
                    >
                        <Callout onPress={() => handleMarkerPress(shelter)}>
                            <View style={styles.calloutView}>
                                <Text style={styles.calloutTitle}>{shelter.name}</Text>
                                <Text>Vagas: {shelter.availableSpots}</Text>
                                <Text style={styles.calloutPressText}>Toque para ver detalhes</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.findButton]}
                    onPress={findAvailableShelters}
                    disabled={loadingShelters}
                >
                    <Text style={styles.buttonText}>
                        {loadingShelters ? "Buscando Abrigos..." : "Visualizar Abrigos Disponíveis"}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderShelterDetailsModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    map: {
        flex: 1,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minWidth: 220,
        marginVertical: 5,
    },
    findButton: {
        backgroundColor: '#007AFF', // Azul
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo escurecido
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'left',
        alignSelf: 'stretch', // Para o texto ocupar a largura
        color: '#555',
    },
    modalTextBold: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
        alignSelf: 'stretch',
        color: '#E67E22', // Laranja para destaque
    },
    modalButtonContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    checkInButton: {
        backgroundColor: '#28A745', // Verde
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#DC3545', // Vermelho
    },
    fullText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC3545', // Vermelho
        textAlign: 'center',
        marginBottom: 15,
    },
    // Estilos do Callout (balão do marcador no mapa)
    calloutView: {
        padding: 10,
        minWidth: 150,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    calloutPressText: {
        color: '#007AFF',
        marginTop: 5,
    }
});