export interface Question {
  id: string;
  q: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: string;
  image?: string; // Ruta de la imagen opcional
}

const questions: Question[] = [
  // 🟢 NIVEL 2 FÁCIL - Preguntas básicas nivel 2 (5 preguntas)
  {
    id: '2-1',
    q: '¿Qué significa la señal de "PARE"?',
    options: ['Seguir derecho', 'Detenerse completamente', 'Girar a la derecha', 'Disminuir velocidad'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'easy',
    image: 'senal-pare.png' // Imagen de señal de PARE
  },
  {
    id: '2-2',
    q: '¿Dónde deben cruzar los peatones?',
    options: ['En cualquier lugar', 'Por el paso de peatones', 'Entre los autos', 'Corriendo'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'easy',
    image: 'paso-peatones-nivel2.png' // Imagen de paso de peatones nivel 2
  },
  {
    id: '2-3',
    q: '¿Qué color indica que puedes cruzar como peatón?',
    options: ['Rojo', 'Amarillo', 'Verde', 'Azul'],
    answer: 2,
    category: 'Cruces y semáforos',
    difficulty: 'easy',
    image: 'semaforo-verde-peaton.png' // Imagen de semáforo verde para peatones
  },
  {
    id: '2-4',
    q: '¿Qué debes hacer antes de abrir la puerta del auto?',
    options: ['Abrir rápido', 'Mirar atrás', 'Empujar fuerte', 'Golpear la puerta'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'easy',
    image: 'mirar-atras-auto.png' // Imagen de persona mirando atrás antes de abrir puerta
  },
  {
    id: '2-5',
    q: '¿Dónde está prohibido jugar?',
    options: ['En el parque', 'En la calle', 'En la casa', 'En la escuela'],
    answer: 1,
    category: 'Normas básicas',
    difficulty: 'easy',
    image: 'prohibido-jugar-calle.png' // Imagen de niños jugando en la calle (prohibido)
  },

  // 🟡 NIVEL 2 MEDIO - Preguntas intermedias nivel 2 (5 preguntas)
  {
    id: '2-6',
    q: '¿Qué significa la señal de "PROHIBIDO GIRAR A LA IZQUIERDA"?',
    options: ['Puedes girar izquierda', 'No puedes girar izquierda', 'Debes girar izquierda', 'Girar dos veces'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'medium',
    image: 'senal-prohibido-girar.png' // Imagen de señal de prohibido girar izquierda
  },
  {
    id: '2-7',
    q: '¿Qué debes hacer en una rotonda?',
    options: ['Detenerte', 'Ceder el paso', 'Acelerar', 'Tocar el claxon'],
    answer: 1,
    category: 'Normas de circulación',
    difficulty: 'medium',
    image: 'rotonda.png' // Imagen de rotonda
  },
  {
    id: '2-8',
    q: '¿Cuál es la velocidad máxima en zona urbana?',
    options: ['20 km/h', '50 km/h', '80 km/h', '100 km/h'],
    answer: 1,
    category: 'Normas de circulación',
    difficulty: 'medium',
    image: 'velocidad-urbana.png' // Imagen de señal de velocidad urbana
  },
  {
    id: '2-9',
    q: '¿Qué significa la línea amarilla continua?',
    options: ['Puedes cruzar', 'No puedes cruzar ni adelantar', 'Solo para bicicletas', 'Carril rápido'],
    answer: 1,
    category: 'Marcas viales',
    difficulty: 'medium',
    image: 'linea-amarilla-continua.png' // Imagen de línea amarilla continua
  },
  {
    id: '2-10',
    q: '¿Qué debes hacer si ves una ambulancia con sirena?',
    options: ['Seguir normal', 'Acelerar', 'Detenerte a un lado', 'Tocar el claxon'],
    answer: 2,
    category: 'Emergencias',
    difficulty: 'medium',
    image: 'ambulancia-sirena.png' // Imagen de ambulancia con sirena
  },

  // 🔴 NIVEL 2 DIFÍCIL - Preguntas avanzadas nivel 2 (5 preguntas)
  {
    id: '2-11',
    q: '¿Qué significa la señal de "FIN DE PROHIBICIÓN"?',
    options: ['Empieza una prohibición', 'Termina una prohibición', 'Prohibido parar', 'Velocidad mínima'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'hard',
    image: 'senal-fin-prohibicion.png' // Imagen de señal de fin de prohibición
  },
  {
    id: '2-12',
    q: '¿Cuál es la distancia mínima de seguridad?',
    options: ['1 metro', 'La mitad de la velocidad', '2 segundos', '5 metros'],
    answer: 2,
    category: 'Seguridad vial',
    difficulty: 'hard',
    image: 'distancia-seguridad.png' // Imagen ilustrando distancia de seguridad
  },
  {
    id: '2-13',
    q: '¿Qué significa la luz intermitente amarilla?',
    options: ['Detenerse', 'Precaución, avanza despacio', 'Acelerar', 'Prohibido pasar'],
    answer: 1,
    category: 'Cruces y semáforos',
    difficulty: 'hard',
    image: 'semaforo-amarillo-intermitente.png' // Imagen de semáforo amarillo intermitente
  },
  {
    id: '2-14',
    q: '¿Dónde está prohibido usar el teléfono móvil?',
    options: ['Solo en casa', 'Mientras se conduce', 'En el parque', 'En la escuela'],
    answer: 1,
    category: 'Normas de circulación',
    difficulty: 'hard',
    image: 'prohibido-celular-conduciendo.png' // Imagen de prohibido usar celular conduciendo
  },
  {
    id: '2-15',
    q: '¿Qué debes hacer en un paso a nivel con barreras?',
    options: ['Cruzar rápido', 'Esperar a que se levanten las barreras', 'Saltar las barreras', 'Tocar el claxon'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'hard',
    image: 'paso-nivel-barreras.png' // Imagen de paso a nivel con barreras
  }
];

export default questions;
