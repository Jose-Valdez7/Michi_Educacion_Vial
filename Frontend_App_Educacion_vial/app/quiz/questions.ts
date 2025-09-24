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
  // 🟢 NIVEL FÁCIL - Normas básicas y peatones (5 preguntas)
  {
    id: '1',
    q: '¿Dónde deben caminar los peatones?',
    options: ['En la calzada', 'En la acera', 'En el carril de buses', 'En la ciclovía'],
    answer: 1,
    category: 'Normas básicas',
    difficulty: 'easy',
    image: 'peatones.png' // Imagen de peatones caminando por la acera
  },
  {
    id: '2',
    q: '¿Qué debes hacer antes de cruzar la calle?',
    options: ['Mirar a ambos lados', 'Cerrar los ojos', 'Correr rápido', 'Escuchar música'],
    answer: 0,
    category: 'Cruces y semáforos',
    difficulty: 'easy',
    image: 'mirar-ambos-lados.png' // Imagen de un niño mirando a ambos lados
  },
  {
    id: '3',
    q: '¿Qué es una acera?',
    options: ['Un lugar para los carros', 'Un lugar para caminar', 'Un parque', 'Un semáforo'],
    answer: 1,
    category: 'Normas básicas',
    difficulty: 'easy',
    image: 'acera.png' // Imagen de una acera con peatones
  },
  {
    id: '4',
    q: '¿Qué significa la luz roja del semáforo?',
    options: ['Seguir caminando', 'Esperar', 'Correr rápido', 'Cruzar sin mirar'],
    answer: 1,
    category: 'Cruces y semáforos',
    difficulty: 'easy',
    image: 'semaforo-rojo.png' // Imagen de semáforo en rojo
  },
  {
    id: '5',
    q: '¿Qué significa la luz verde para peatones?',
    options: ['Esperar', 'Cruzar', 'Correr', 'Sentarse'],
    answer: 1,
    category: 'Cruces y semáforos',
    difficulty: 'easy',
    image: 'semaforo-verde.png' // Imagen de semáforo en verde
  },

  // 🟡 NIVEL MEDIO - Preguntas para niños de 7-9 años (5 preguntas)
  {
    id: '6',
    q: '¿Qué significa la señal redonda con borde rojo?',
    options: ['Se puede pasar', 'No se puede pasar', 'Cuidado', 'Zona de juegos'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'medium',
    image: 'senal-prohibicion.png' // Imagen de señal de prohibición
  },
  {
    id: '7',
    q: '¿Qué debes hacer cuando ves un paso de peatones?',
    options: ['Correr más rápido', 'Mirar bien', 'Saltar', 'Gritar'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'medium',
    image: 'paso-peatones.png' // Imagen de paso de peatones
  },
  {
    id: '8',
    q: '¿Dónde se debe esperar para cruzar la calle?',
    options: ['En medio de la calle', 'Detrás de la línea blanca', 'En cualquier lugar', 'Corriendo'],
    answer: 1,
    category: 'Normas básicas',
    difficulty: 'medium',
    image: 'linea-blanca.png' // Imagen de línea blanca de cruce
  },
  {
    id: '9',
    q: '¿Qué significa la señal de "CEDA EL PASO"?',
    options: ['Detenerse', 'Dejar pasar', 'Acelerar', 'Saltar'],
    answer: 1,
    category: 'Señales de tráfico',
    difficulty: 'medium',
    image: 'senal-ceda-paso.png' // Imagen de señal de ceda el paso
  },
  {
    id: '10',
    q: '¿Por qué es importante mirar a ambos lados?',
    options: ['Para ver mejor', 'Para ver si vienen autos', 'Para correr más rápido', 'Para jugar'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'medium',
    image: 'mirar-autos.png' // Imagen de niño mirando autos
  },

  // 🔴 NIVEL DIFÍCIL - Preguntas para niños de 10-12 años (5 preguntas)
  {
    id: '11',
    q: '¿Qué debes hacer si ves una zona escolar?',
    options: ['Correr', 'Ir más despacio', 'Tocar el claxon', 'Acelerar'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'hard',
    image: 'zona-escolar.png' // Imagen de zona escolar
  },
  {
    id: '12',
    q: '¿Dónde está prohibido estacionar?',
    options: ['En cualquier lugar', 'En el garaje', 'Frente a una entrada', 'En la casa'],
    answer: 2,
    category: 'Normas de circulación',
    difficulty: 'hard',
    image: 'prohibido-estacionar.png' // Imagen de señal de prohibido estacionar
  },
  {
    id: '13',
    q: '¿Qué significa la luz amarilla del semáforo?',
    options: ['Detenerse', 'Precaución', 'Acelerar', 'Seguir normal'],
    answer: 1,
    category: 'Cruces y semáforos',
    difficulty: 'hard',
    image: 'semaforo-amarillo.png' // Imagen de semáforo en amarillo
  },
  {
    id: '14',
    q: '¿Por qué es importante usar el cinturón de seguridad?',
    options: ['Para estar cómodo', 'Para no caerse', 'Para estar más guapo', 'Para jugar mejor'],
    answer: 1,
    category: 'Seguridad vial',
    difficulty: 'hard',
    image: 'cinturon-seguridad.png' // Imagen de cinturón de seguridad
  },
  {
    id: '15',
    q: '¿Qué debes hacer en un cruce sin semáforo?',
    options: ['Correr rápido', 'Mirar bien y esperar', 'Saltar', 'Gritar'],
    answer: 1,
    category: 'Normas básicas',
    difficulty: 'hard',
    image: 'cruce-sin-semaforo.png' // Imagen de cruce sin semáforo
  }
];

export default questions;
