import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.4;

export default function Delivered() {
    const router = useRouter();
    const [mapRegion, setMapRegion] = useState({
        latitude: -23.550520,
        longitude: -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [userName, setUserName] = useState('');

    useEffect(() => {
        
        const user = auth.currentUser;
        if (user) {
            setUserName(user.displayName || 'Usuário');
        }

        const getUserLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Não é possível acessar a localização para mostrar no mapa.');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setMapRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.02, 
                    longitudeDelta: 0.01,
                });
            } catch (error) {
                console.error("Erro ao obter localização: ", error);
                Alert.alert("Erro de Localização", "Não foi possível obter sua localização atual.")
            }
        };
        getUserLocation();
    }, []);

    
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/preparing'); 
        } catch (error) {
            console.error("Erro ao fazer logout: ", error);
            Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
        }
    };

    return (
        <View style={styles.container}>
            {}
            <Text style={styles.title}>Bem-vindo, {userName}!</Text>
            <Text style={styles.subtitle}>Sua localização é mostrada no mapa abaixo.</Text>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                >
                    {}
                </MapView>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/shelterApp')}
            >
                <Text style={styles.buttonText}>Visualizar Abrigos Disponíveis</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Sair (Logout)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        paddingTop: 50, 
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    mapContainer: {
        width: width * 0.9, 
        height: height * MAP_HEIGHT_PERCENTAGE,
        borderRadius: 10,
        overflow: 'hidden', 
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    map: {
        ...StyleSheet.absoluteFillObject, 
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    
    logoutButton: {
        marginTop: 20,
        paddingVertical: 10,
    },
    logoutButtonText: {
        color: '#E74C3C', 
        fontSize: 16,
        fontWeight: '500',
    },
});