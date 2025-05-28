//Importanto o componente Drawer da biblioteca expo-router/drawer
import { Drawer } from 'expo-router/drawer';

//Configurando o Drawer funcional TabLayout como padrão de exportação
export default function TabLayout() {
  return (
    //Configura um Drawer Navigator para a navegação lateral 
    <Drawer
    screenOptions={{headerShown: true}}
    defaultStatus='closed'    
    //Configura o Drawer Navigator com o nome de 'index'
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
        
    </Drawer>
  );
}