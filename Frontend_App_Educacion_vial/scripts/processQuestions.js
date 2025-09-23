const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function extractQuestions(docxPath) {
  try {
    // Leer el archivo DOCX
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value;
    
    // Dividir el texto en líneas
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const questions = [];
    let currentQuestion = null;
    
    // Procesar cada línea
    for (const line of lines) {
      // Detectar si es el inicio de una nueva pregunta (número seguido de punto)
      const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
      
      if (questionMatch) {
        // Guardar la pregunta anterior si existe
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        // Crear nueva pregunta
        currentQuestion = {
          id: `q${questionMatch[1]}`,
          q: questionMatch[2],
          options: [],
          answer: -1,
          category: 'Educación Vial',
          difficulty: 'medium'
        };
      } 
      // Detectar opciones de respuesta (letra seguida de paréntesis)
      else if (currentQuestion && line.match(/^[A-Za-z]\)\s*(.+)/)) {
        const optionMatch = line.match(/^([A-Za-z])\)\s*(.+)/);
        const optionText = optionMatch[2];
        const optionLetter = optionMatch[1].toUpperCase();
        
        currentQuestion.options.push(optionText);
        
        // Si la línea contiene la respuesta correcta (normalmente marcada con un * al final)
        if (optionText.includes('*')) {
          currentQuestion.answer = currentQuestion.options.length - 1;
          // Eliminar el marcador de la opción
          currentQuestion.options[currentQuestion.options.length - 1] = 
            optionText.replace(/\s*\*$/, '').trim();
        }
      }
    }
    
    // Asegurarse de agregar la última pregunta procesada
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    // Validar que todas las preguntas tengan respuesta
    const validQuestions = questions.filter(q => 
      q.options.length >= 2 && 
      q.answer >= 0 && 
      q.answer < q.options.length
    );
    
    console.log(`Procesadas ${validQuestions.length} preguntas válidas de ${questions.length} totales.`);
    
    // Guardar las preguntas en un archivo JSON
    const outputPath = path.join(__dirname, '..', 'app', 'quiz', 'questions.json');
    fs.writeFileSync(outputPath, JSON.stringify(validQuestions, null, 2));
    
    console.log(`Preguntas guardadas en: ${outputPath}`);
    
    return validQuestions;
  } catch (error) {
    console.error('Error al procesar el documento:', error);
    throw error;
  }
}

// Ejecutar el script
const docxPath = process.argv[2];
if (!docxPath) {
  console.error('Por favor, proporciona la ruta al archivo DOCX como argumento.');
  console.log('Ejemplo: node processQuestions.js "ruta/a/tu/archivo.docx"');
  process.exit(1);
}

extractQuestions(docxPath)
  .then(() => console.log('Proceso completado exitosamente.'))
  .catch(err => console.error('Error:', err));
