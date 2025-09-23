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
  },
  {
    id: '6',
    q: '¿Qué significa la señal triangular con borde rojo?',
    options: ['Ceda el paso', 'Prohibido girar', 'Zona escolar', 'Velocidad máxima'],
    answer: 0,
    category: 'Señales de tráfico',
    difficulty: 'easy'
  },
  {
    id: '7',
    q: '¿Cuál es el límite de velocidad en autopistas?',
    options: ['80 km/h', '100 km/h', '120 km/h', '140 km/h'],
    answer: 1,
    category: 'Límites de velocidad',
    difficulty: 'easy'
  },
  {
    id: '8',
    q: '¿Qué indica una línea blanca discontinua?',
    options: ['Prohibido adelantar', 'Puede adelantar', 'Carril exclusivo', 'Zona de peligro'],
    answer: 1,
    category: 'Marcas viales',
    difficulty: 'medium'
  },
  {
    id: '9',
    q: '¿Qué hacer cuando ves la señal de "PARE"?',
    options: ['Reducir velocidad', 'Detenerse completamente', 'Tocar el claxon', 'Acelerar'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'easy'
  },
  {
    id: '10',
    q: '¿Cuál es la distancia mínima de seguridad en ciudad?',
    options: ['5 metros', '10 metros', '15 metros', '20 metros'],
    answer: 0,
    category: 'Conducción segura',
    difficulty: 'medium'
  },
  {
    id: '11',
    q: '¿Qué significa la señal octogonal roja?',
    options: ['Detención obligatoria', 'Prohibido estacionar', 'Zona peligrosa', 'Velocidad controlada'],
    answer: 0,
    category: 'Señales de tráfico',
    difficulty: 'medium'
  },
  {
    id: '12',
    q: '¿Cuál es el significado de las luces intermitentes amarillas?',
    options: ['Precaución', 'Prohibido pasar', 'Velocidad máxima', 'Zona de obras'],
    answer: 0,
    category: 'Señales luminosas',
    difficulty: 'medium'
  },
  {
    id: '13',
    q: '¿Qué indica una línea amarilla discontinua?',
    options: ['Adelantamiento permitido', 'Adelantamiento prohibido', 'Carril reversible', 'Zona escolar'],
    answer: 0,
    category: 'Marcas viales',
    difficulty: 'hard'
  },
  {
    id: '14',
    q: '¿Cuál es la prioridad en una rotonda?',
    options: ['Los que entran', 'Los que circulan', 'Los vehículos pesados', 'Los vehículos pequeños'],
    answer: 1,
    category: 'Normas de circulación',
    difficulty: 'hard'
  },
  {
    id: '15',
    q: '¿Qué significa la señal de prohibido girar a la izquierda?',
    options: ['Solo permitido en horarios específicos', 'Prohibido completamente', 'Permitido con precaución', 'Solo para emergencias'],
    answer: 1,
    category: 'Señales de prohibición',
    difficulty: 'hard'
  }
];

export default questions;
