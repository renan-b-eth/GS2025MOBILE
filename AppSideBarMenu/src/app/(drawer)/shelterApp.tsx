import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import axios from 'axios';


interface Shelter {
    id: number;
    nome: string;
    endereco: string;
    regiao: string;
    temperatura: number;
    recursos: string;
    capacidade: number;
    ocupacao: number;
    ativo: boolean;
    responsavel: string;
    telefone: string;
}

interface ShelterWithAvailability extends Shelter {
    availableSpots: number;
    resourcesList: string[];
}

const API_URL = 'https://abrigoapi95111.azurewebsites.net/api/abrigos';

export default function ShelterApp() {
    const [currentView, setCurrentView] = useState<'listView' | 'dashboardView'>('listView');
    const [shelters, setShelters] = useState<ShelterWithAvailability[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShelters = useCallback(async (showLoadingIndicator = false) => {
        console.log("Buscando dados da API com Axios...");
        if (showLoadingIndicator || shelters.length === 0) {
            setLoadingData(true);
        }
        try {
            const response = await axios.get<Shelter[]>(API_URL);
            const data = response.data;

            const processedShelters = data.map(shelter => ({
                ...shelter,
                availableSpots: shelter.capacidade - shelter.ocupacao,
                resourcesList: shelter.recursos ? shelter.recursos.split(',').map(r => r.trim()) : [],
            }));

            setShelters(processedShelters);
            setError(null);
        } catch (e) {
            console.error("Falha ao buscar abrigos com Axios: ", e);
            setError("Não foi possível carregar os dados. Verifique sua conexão e a API.");
        } finally {
            setLoadingData(false);
        }
    }, [shelters.length]);

    useEffect(() => {
        fetchShelters(); 
        const intervalId = setInterval(() => {
            fetchShelters(); 
        }, 10000); 
        return () => clearInterval(intervalId);
    }, [fetchShelters]);

    
    const handleCheckIn = async (shelterToCheckIn: ShelterWithAvailability) => {
        
        if (shelterToCheckIn.availableSpots <= 0) {
            Alert.alert("Abrigo Lotado", `Não há mais vagas disponíveis em "${shelterToCheckIn.nome}".`);
            return;
        }

       
        Alert.alert(
            "Confirmar Check-in",
            `Deseja registrar a entrada de 1 pessoa no abrigo "${shelterToCheckIn.nome}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Confirmar", 
                    onPress: async () => {
                        
                        const updatedShelter = {
                            ...shelterToCheckIn,
                            ocupacao: shelterToCheckIn.ocupacao + 1, 
                        };
                       
                        delete (updatedShelter as any).availableSpots;
                        delete (updatedShelter as any).resourcesList;

                        try {
                           
                            await axios.put(`${API_URL}/${shelterToCheckIn.id}`, updatedShelter);

                           
                            setShelters(prevShelters => 
                                prevShelters.map(s => {
                                    if (s.id === shelterToCheckIn.id) {
                                        const newOccupancy = s.ocupacao + 1;
                                        return {
                                            ...s,
                                            ocupacao: newOccupancy,
                                            availableSpots: s.capacidade - newOccupancy,
                                        };
                                    }
                                    return s;
                                })
                            );

                            Alert.alert("Sucesso!", "Check-in realizado com sucesso.");

                        } catch (error) {
                            // 6. Tratar erros da API
                            console.error("Erro ao fazer check-in:", error);
                            Alert.alert("Erro", "Não foi possível realizar o check-in. Tente novamente.");
                        }
                    }
                }
            ]
        );
    };
    
    const navigateToView = (view: 'listView' | 'dashboardView') => {
        setCurrentView(view);
    };


    const ShelterCard = ({ item }: { item: ShelterWithAvailability }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.regiao}</Text>
            <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📍</Text> {item.endereco}</Text>
            <View style={styles.infoRow}>
                <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>🌡️</Text> Temp: {item.temperatura}°C</Text>
                <Text style={[styles.cardInfo, styles.availabilityInfo, item.availableSpots > 0 ? styles.spotsAvailable : styles.spotsFull]}>
                    <Text style={styles.infoEmoji}>{item.availableSpots > 0 ? '✅' : '❌'}</Text> Vagas: {item.availableSpots} ({item.ocupacao}/{item.capacidade})
                </Text>
            </View>
            {item.resourcesList.length > 0 && (
                <View style={styles.resourcesContainer}>
                    <Text style={styles.resourcesTitle}><Text style={styles.infoEmoji}>🛠️</Text> Recursos:</Text>
                    <View style={styles.resourceTags}>
                        {item.resourcesList.slice(0, 4).map(res => <Text key={res} style={styles.resourceTag}>{res}</Text>)}
                        {item.resourcesList.length > 4 && <Text style={styles.resourceTag}>+ mais</Text>}
                    </View>
                </View>
            )}
            <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>👤</Text> Responsável: {item.responsavel}</Text>
            <Text style={styles.cardInfo}><Text style={styles.infoEmoji}>📞</Text> Contato: {item.telefone}</Text>
            
            <TouchableOpacity 
                style={[styles.checkInButton, item.availableSpots <= 0 && styles.checkInButtonDisabled]} 
                onPress={() => handleCheckIn(item)}
                disabled={item.availableSpots <= 0}
            >
                <Text style={styles.checkInButtonText}>FAZER CHECK-IN</Text>
            </TouchableOpacity>
        </View>
    );

    const renderListView = () => (
        <View style={styles.viewContainerFull}>
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Abrigos Disponíveis</Text>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateToView('dashboardView')}>
                     <Text style={styles.navButtonText}>Dashboard 📊</Text>
                </TouchableOpacity>
            </View>
            {loadingData && shelters.length === 0 ? (
                <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#007AFF" /><Text>Carregando abrigos...</Text></View>
            ) : error ? (
                <View style={styles.loaderContainer}><Text style={styles.errorText}>{error}</Text></View>
            ) : (
                <FlatList
                    data={shelters}
                    renderItem={({ item }) => <ShelterCard item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    onRefresh={() => fetchShelters(true)}
                    refreshing={loadingData}
                />
            )}
        </View>
    );

    const renderDashboardView = () => (
        <View style={styles.viewContainerFull}>
            <View style={styles.listHeader}>
                <Text style={styles.headerTitle}>Dashboard de Lotação</Text>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateToView('listView')}>
                    <Text style={styles.navButtonText}>Lista 📝</Text>
                </TouchableOpacity>
            </View>
            {loadingData && shelters.length === 0 ? (
                 <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#007AFF" /><Text>Carregando dashboard...</Text></View>
            ) : error ? (
                <View style={styles.loaderContainer}><Text style={styles.errorText}>{error}</Text></View>
            ) : (
                <FlatList
                    data={[...shelters].sort((a, b) => (b.ocupacao / b.capacidade) - (a.ocupacao / a.capacidade))}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    onRefresh={() => fetchShelters(true)}
                    refreshing={loadingData}
                    renderItem={({ item }) => (
                        <View style={styles.dashboardItem}>
                            <Text style={styles.dashboardItemName}>{item.nome}</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={[
                                    styles.progressBarFill,
                                    { width: `${(item.ocupacao / item.capacidade) * 100}%` }
                                ]} />
                            </View>
                            <Text style={styles.dashboardItemInfo}>
                                Ocupação: {item.ocupacao} / {item.capacidade} (Vagas: {item.availableSpots})
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum dado para exibir.</Text>}
                />
            )}
        </View>
    );
    
    if (loadingData && shelters.length === 0 && !error) {
        return (
            <SafeAreaView style={[styles.fullScreen, styles.loaderContainer]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loaderText}>Iniciando sistema de abrigos...</Text>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.fullScreen}>
            {currentView === 'listView' && renderListView()}
            {currentView === 'dashboardView' && renderDashboardView()}
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: '#F4F7FC' },
    viewContainerFull: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
    listHeader: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
    navButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EAECEE', borderRadius: 20 },
    navButtonText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#E74C3C', fontSize: 16, textAlign: 'center' },
    loaderText: { marginTop: 10, fontSize: 16, color: '#555' },
    emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#777' },
    listContentContainer: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 15, elevation: 4, shadowColor: '#B0C0D0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, borderWidth: 1, borderColor: '#E8EEF5' },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#34495E', marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: '#7F8C8D', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
    cardInfo: { fontSize: 15, color: '#555', marginBottom: 8, lineHeight: 22 },
    infoEmoji: { fontSize: 15 },
    availabilityInfo: { fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: 'transparent' },
    spotsAvailable: { color: '#27AE60', backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
    spotsFull: { color: '#E74C3C', backgroundColor: '#FDEDED', borderColor: '#F5B7B1' },
    resourcesContainer: { marginTop: 8, marginBottom: 10 },
    resourcesTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 5 },
    resourceTags: { flexDirection: 'row', flexWrap: 'wrap' },
    resourceTag: { backgroundColor: '#EAECEE', color: '#5D6D7E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 6, marginBottom: 6, fontSize: 12, fontWeight: '500' },
    checkInButton: { backgroundColor: '#3498DB', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    checkInButtonDisabled: {
        backgroundColor: '#a9a9a9', 
    },
    checkInButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
    dashboardItem: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
    dashboardItemName: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    dashboardItemInfo: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'right' },
    progressBarContainer: { height: 22, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden', marginTop: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 10 },
});