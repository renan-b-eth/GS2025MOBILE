export interface Shelter {
    id: string;
    name: string;
    latitude: number; 
    longitude: number;
    locality: string; 
    temperature?: string;
    capacity: number;
    currentOccupancy: number;
    availableSpots: number;
}

// Dados fictícios 
export const MOCK_SHELTERS: Shelter[] = [
    {
        id: 'shelter1',
        name: 'Abrigo Central Esperança',
        latitude: -23.550520,
        longitude: -46.633308,
        locality: 'Centro, Próximo à Praça da Sé',
        temperature: '20°C',
        capacity: 100,
        currentOccupancy: 75,
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter2',
        name: 'Refúgio Bem-Estar Norte',
        latitude: -23.540000,
        longitude: -46.640000,
        locality: 'Zona Norte, Av. Cruzeiro do Sul',
        temperature: '19°C',
        capacity: 50,
        currentOccupancy: 48,
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter3',
        name: 'Ponto de Apoio Sul',
        latitude: -23.561318,
        longitude: -46.656189,
        locality: 'Zona Sul, Perto do Parque Ibirapuera',
        temperature: '21°C',
        capacity: 30,
        currentOccupancy: 30, 
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
    {
        id: 'shelter4',
        name: 'Casa de Acolhimento Leste',
        latitude: -23.545000,
        longitude: -46.500000,
        locality: 'Zona Leste, Metrô Itaquera',
        temperature: '20°C',
        capacity: 70,
        currentOccupancy: 30,
        get availableSpots() { return this.capacity - this.currentOccupancy; }
    },
];