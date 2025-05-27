import { StyleSheet, Text, View, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Função para redirecionar após 3 segundos (apenas na primeira vez)
    useEffect(() => {
        if (isFirstLoad) {
            const timer = setTimeout(() => {
                router.push('/preparing');
                setIsFirstLoad(false);
            }, 3500);
            // Limpa o timer quando o componente é desmontado
            return () => clearTimeout(timer);
        }
    }, [isFirstLoad]);

    // Funções utilitárias para AsyncStorage
    const storeData = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error("Erro ao salvar no AsyncStorage:", error);
        }
    };

    const getData = async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                return value;
            }
        } catch (error) {
            console.error("Erro ao buscar no AsyncStorage:", error);
        }
    };

    const removeData = async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error("Erro ao remover no AsyncStorage:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}></Text>
            <Image
                source={require('./logo.png')}
                style={{
                    width: 200,
                    height: 200,
                    resizeMode: 'contain'
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#000",
    }
});