import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import { MOCK_SHELTERS, Shelter } from './interfaces'; // Supondo que você criou um arquivo data.ts
// Se não criou, cole as definições de Shelter e MOCK_SHELTERS aqui ou importe de onde estiverem
import { Stack, useRouter } from 'expo-router';


// Supondo que MOCK_SHELTERS e Shelter estão definidos em algum lugar importável
// ou defina-os aqui se preferir (como no exemplo anterior).
// Para este exemplo, vou simular a busca aqui.

export default function ShelterListScreen() {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Simula a busca por abrigos
    const findAvailableShelters = async () => {
        setLoading(true);
        console.log("Buscando abrigos (simulação)...");
        // Em um app real, você faria uma chamada a uma API aqui
        setTimeout(() => {
            // Filtra apenas abrigos com vagas para o exemplo
            const available = MOCK_SHELTERS.map(s => ({...s, availableSpots: s.capacity - s.currentOccupancy}));
            // .filter(shelter => shelter.availableSpots > 0); // Descomente para mostrar apenas com vagas
            setShelters(available);
            setLoading(false);
        }, 1000); // Simula delay de rede
    };

    useEffect(() => {
        findAvailableShelters();
    }, []);

    const renderItem = ({ item }: { item: Shelter }) => (
        <View style={[styles.shelterItem, item.availableSpots <= 0 && styles.shelterFull]}>
            <Text style={styles.shelterName}>{item.name}</Text>
            <Text style={styles.shelterDetail}>Localidade: {item.locality}</Text>
            <Text style={styles.shelterDetail}>Temperatura: {item.temperature || 'Não informada'}</Text>
            <Text style={styles.shelterDetail}>
                Lotação: {item.currentOccupancy} / {item.capacity}
            </Text>
            <Text style={[styles.shelterDetail, item.availableSpots > 0 ? styles.spotsAvailable : styles.spotsFull]}>
                Vagas: {item.availableSpots}
            </Text>
            {/* Exemplo de como adicionar um botão de check-in ou mais detalhes no futuro:
            {item.availableSpots > 0 && (
                <TouchableOpacity style={styles.checkInButton} onPress={() => {/ ... /}}>
                    <Text style={styles.checkInButtonText}>Check-in</Text>
                </TouchableOpacity>
            )}
            */}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Carregando abrigos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
             {/* Opção para mudar o título da tela se o _layout.tsx não for usado */}
            {/* <Stack.Screen options={{ title: "Abrigos Disponíveis" }} /> */}
            <FlatList
                data={shelters}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum abrigo encontrado.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContentContainer: {
        padding: 15,
    },
    shelterItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    shelterFull: {
        backgroundColor: '#ffebee', // Um tom claro de vermelho para indicar lotado
        borderColor: '#ffcdd2',
    },
    shelterName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    shelterDetail: {
        fontSize: 14,
        marginBottom: 3,
        color: '#555',
    },
    spotsAvailable: {
        color: 'green',
        fontWeight: 'bold',
    },
    spotsFull: {
        color: 'red',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
    },
    // Estilos para botão de check-in (exemplo futuro)
    /*
    checkInButton: {
        marginTop: 10,
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    checkInButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    */
});