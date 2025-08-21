# 🚀 Mini Asistente de Q&A - Prueba Técnica

¡Hola! 👋 Bienvenido/a al repositorio del Mini Asistente de Q&A, una solución completa para cargar, buscar y consultar documentos de texto.

## ✨ Características

- 📤 **Carga de documentos**: Soporta archivos TXT y PDF (entre 3 y 10 archivos)
- 🔍 **Búsqueda semántica**: Encuentra contenido relevante en tus documentos
- ❓ **Pregunta y respuesta**: Haz preguntas en lenguaje natural y obtén respuestas con citas
- 🎨 **Interfaz intuitiva**: Diseño limpio y fácil de usar
- 🐳 **Contenedores Docker**: Fácil despliegue y ejecución

## 🛠️ Implementaciones

### Backend
- **FastAPI** - Framework web moderno y rápido orientado a desarrollo de apis
- **Rate Limiting** - Técnica de seguridad para protección masiva de solicitudes
- **Persistencia** - La información del contenido subido queda almacenado
- **PyPDF2** - Procesamiento de archivos PDF

### Frontend
- **React** + **TypeScript** - Interfaz de usuario
- **Css** - Diseño

### Infraestructura
- **Docker** + **Docker Compose** - Contenedores y orquestación
- **oLlama - Tiny** - modelo LLM de ollama ligero

## 🚀 Instrucciones de ejecución

### Prerrequisitos
- Docker y Docker Compose instalados
- Git para clonar el repositorio
- Puertos 3000, 8000 y 11434 libres

### Ejecución con Docker Compose

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd PruebaDynecron
```

2. Ejecuta el Sistema Completo:
```bash
docker-compose up
```

3. Esperar a que los contenedores estén levantados y funcionando

4. Acceder a la web: 
   front - http://localhost:3000 
   back - http://localhost:8000/docs

## 🚀 Decisiones

### Elección de Ollama y un modelo local:

    -Decisión: Utilizar Ollama con un modelo de lenguaje local (específicamente el modelo "Tiny") en un contenedor independiente.

    -Justificación: Esta arquitectura garantiza que el modelo esté siempre disponible, sin depender de la latencia o disponibilidad de servicios externos. Se prioriza la autonomía y el control total sobre el entorno de inferencia.

    -Implicación: Se asume la responsabilidad de mantener la infraestructura y el rendimiento del modelo, a cambio de eliminar costos variables por uso de API y limitaciones de tasa (rate limiting).

### Selección del modelo específico "Tiny":

    -Decisión: Emplear la variante de modelo más ligera disponible.

    -Justificación: La elección se basó en la restricción principal de hardware: la necesidad de ejecutarse de manera eficiente en entornos con recursos limitados (dispositivos con 8 GB de RAM o menos) dentro de un contenedor.

    -Implicación: Esta decisión conlleva una compensación (trade-off) entre accesibilidad/eficiencia y la potencia/capacidad del modelo.

### Implementación de Búsqueda en Documentos:

        -Decisión: Implementar una funcionalidad de búsqueda utilizando un procesamiento básico de texto (como coincidencia de palabras clave o términos) en lugar de una solución avanzada con modelos de embeddings, bases de datos vectoriales , etc .

        -Justificación: Esta decisión se tomó para priorizar la simplicidad del desarrollo, reducir la complejidad arquitectónica y minimizar la sobrecarga computacional. El objetivo era obtener una funcionalidad de búsqueda mínima viable (MVP) rápidamente.

        -Implicación: La búsqueda será menos inteligente y precisa. No podrá encontrar conceptos o sinónimos relacionados semánticamente, sino solo coincidencias literales de texto.

## 🚀 Supuestos

###    Supuesto de Autonomía vs. Calidad:

        -Supuesto: Se asumió que la ventaja de tener un sistema siempre disponible y sin costos operativos variables (autonomía) tendría más peso que la posible pérdida en la calidad de las respuestas en comparación con modelos de API más avanzados (como GPT-4).

        -Estado: Parcialmente validado. Se logró la autonomía, pero la limitación en la calidad es más significativa de lo previsto.

###    Supuesto de Costo Total de Propiedad (TCO):

        -Supuesto: Se consideró que el costo de mantener la infraestructura local (tiempo de desarrollo, administración y energía) sería menor a largo plazo que el costo acumulado de usar APIs de pago por uso para el volumen de peticiones esperado.

        -Estado: Validado para el escenario actual. Dado el bajo volumen o uso experimental, el costo local es efectivamente menor.

###    Supuesto de Hardware Mínimo:

        -Supuesto: Se dio por hecho que el hardware base del objetivo (dispositivos con 8 GB de RAM) sería suficiente para ejecutar el modelo Tiny y la aplicación simultáneamente con un rendimiento aceptable para el usuario.

        -Estado: Validado. El modelo funciona en el hardware objetivo, aunque con limitaciones.

###    Supuesto de Adecuación al Uso:

        -Supuesto: Se creyó que las capacidades del modelo Tiny, aunque limitadas, serían suficientes para el scope funcional del proyecto (por ejemplo, generar respuestas cortas, resúmenes básicos o clasificaciones simples).

        -Estado: Invalidado. La experiencia práctica demostró que el modelo es "poco eficiente con limitaciones técnicas en cuanto a prompt y respuestas, por lo que no es recomendable para proyectos serios". Este es un aprendizaje clave.

### Supuesto sobre el Patrón de Búsqueda de los Usuarios:

    -Supuesto: Se partió de la base de que los usuarios realizarían búsquedas utilizando palabras clave exactas y específicas presentes en los documentos, en lugar de búsquedas conceptuales o por similitud semántica.

    -Estado: Por validar. La efectividad de este enfoque se confirmará o refutará con el feedback real de los usuarios finales.

## 🚀 Tiempo de desarrollo

14 horas - Estaba empeñado en hacer correr un modelo en el contenedor, así como determinar el script correcto para la descarga automática del modelo en dado caso no exista 🤪🐳💻

## Funciona?

- El sistema es completamente funcional con ciertas limitaciones en el LLM por el modelo ligero utilizado, dando en ocasiones respuestas incorrectas por la incapacidad de procesar toda la información. Por lo que es recomendable utilizar una api lista sin trabajar con modelos locales

## Sistema

### Agregar Documentos

![1 (alt text)](Fotos%20Q&A/Agregar%20Documentos.JPG)
![2 (alt text)](Fotos%20Q&A/Agregar%20Documentos%20Funcional.JPG)

### Buscar Información

![1 (alt text)](Fotos%20Q&A/Buscar%20Documentos.JPG)
![2 (alt text)](Fotos%20Q&A/Buscar%20Documentos%20Funcional.JPG)

### Preguntar con LLM

![1 (alt text)](Fotos%20Q&A/Pregunta%20IA.JPG)
![1 (alt text)](Fotos%20Q&A/Pregunta%20IA%20Funcional%201.JPG)
![1 (alt text)](Fotos%20Q&A/Pregunta%20IA%20Funcional%202.JPG)