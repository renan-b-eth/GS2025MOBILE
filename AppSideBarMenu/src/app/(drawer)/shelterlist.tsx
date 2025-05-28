import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import { MOCK_SHELTERS, Shelter } from './interfaces'; 
import { Stack, useRouter } from 'expo-router';



export default function ShelterListScreen() {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Simula a busca por abrigos
    const findAvailableShelters = async () => {
        setLoading(true);
        console.log("Buscando abrigos (simulação)...");
        setTimeout(() => {
            const available = MOCK_SHELTERS.map(s => ({...s, availableSpots: s.capacity - s.currentOccupancy}));
        
            setShelters(available);
            setLoading(false);
        }, 1000); 
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
            {}
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
             {}
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
        backgroundColor: '#ffebee', 
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
   
});