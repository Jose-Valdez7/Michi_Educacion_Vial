export interface Question {
  id: string;
  q: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: string;
}

const questions: Question[] = [
  {
    id: '1',
    q: '¿Qué significa la señal de tráfico redonda con borde rojo?',
    options: ['Peligro', 'Prohibición', 'Obligación', 'Advertencia'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'easy'
  },
  {
    id: '2',
    q: '¿A qué distancia mínima debes mantenerte del vehículo que va delante?',
    options: ['2 segundos', '1 segundo', '3 segundos', 'No importa la distancia'],
    answer: 0,
    category: 'Conducción segura',
    difficulty: 'medium'
  },
  {
    id: '3',
    q: '¿Cuál es la velocidad máxima permitida en zona urbana?',
    options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
    answer: 1,
    category: 'Límites de velocidad',
    difficulty: 'easy'
  },
  {
    id: '4',
    q: '¿Qué indica una línea amarilla continua en el borde de la calzada?',
    options: [
      'Prohibido estacionar',
      'Zona de estacionamiento permitido',
      'Carril exclusivo para buses',
      'Vía exclusiva para bicicletas'
    ],
    answer: 0,
    category: 'Marcas viales',
    difficulty: 'medium'
  },
  {
    id: '5',
    q: '¿Qué debes hacer al acercarte a un cruce escolar?',
    options: [
      'Acelerar para pasar rápido',
      'Tocar el claxon para que los niños se aparten',
      'Reducir la velocidad y estar atento',
      'Cambiar de carril rápidamente'
    ],
    answer: 2,
    category: 'Seguridad vial',
    difficulty: 'easy'
  }
];

export default questions;
