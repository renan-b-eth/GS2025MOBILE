// Importanto Slot e useNavigation do expo-router
import {Slot, useNavigation} from "expo-router"

// Importando StatusBar do expo-status-bar
import { StatusBar } from "expo-status-bar"

//Definindo o componente Layout como padrão de exportação
export default function Layout() { 

    const navigation = useNavigation()

    return (
        // Definindo a cor de fundo da StatusBar como transparente
        <>
        <StatusBar style="light" backgroundColor="black" translucent />
        
        <Slot/>
        </>
    )
}