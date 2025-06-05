
import { Drawer } from 'expo-router/drawer';


export default function TabLayout() {
  return (
    
    <Drawer
    screenOptions={{headerShown: true}}
    defaultStatus='closed'    
    
    >
       <Drawer.Screen 
        name="index" 
        options={
            {title: 'Abrigo+'}
        } />      
        <Drawer.Screen
        name="preparing"
        options={
            {title: 'Tela Login'}
        } />
          <Drawer.Screen
        name="sent"
        options={
            {title: 'Recuperação Senha'}
        } />
           <Drawer.Screen
        name="delivered"
        options={
            {title: 'Gerenciador de Abrigos'}
        } />
            <Drawer.Screen
        name="about"
        options={
            {title: 'Abrigos Disponiveis'}
        } />

        <Drawer.Screen
        name="ShelterMonitorScreen"
        options={
            {title: 'Shelter'}
        } />
        
    </Drawer>
  );
}