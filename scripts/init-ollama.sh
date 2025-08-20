#!/bin/bash

echo "🛠️ Verificando curl..."

# Verificar e instalar curl
if ! command -v curl >/dev/null 2>&1; then
    echo "📦 curl no encontrado, instalando..."
    apt-get update && apt-get install -y curl
    if [ $? -eq 0 ]; then
        echo "✅ curl instalado correctamente"
    else
        echo "❌ Error instalando curl"
        exit 1
    fi
else
    echo "✅ curl ya está instalado"
fi

echo "🚀 Iniciando Ollama..."
/bin/ollama serve &

echo "⏳ Esperando que Ollama esté listo..."
sleep 30

echo "🔍 Verificando si Ollama está respondiendo..."
max_attempts=10
attempt=1
success=false

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama está respondiendo"
        success=true
        break
    fi
    
    echo "⏳ Intento $attempt/$max_attempts - Esperando 5 segundos..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ "$success" = false ]; then
    echo "⚠️ Ollama no responde después de $max_attempts intentos, continuando..."
fi

echo "🔍 Verificando y descargando tinyllama..."
if /bin/ollama list 2>/dev/null | grep -q "tinyllama"; then
    echo "✅ Modelo tinyllama ya está cargado"
else
    echo "📦 Descargando modelo tinyllama..."
    
    # Intentar varias versiones de tinyllama
    if /bin/ollama pull tinyllama:1.1b; then
        echo "✅ tinyllama:1.1b descargado exitosamente"
    elif /bin/ollama pull tinyllama; then
        echo "✅ tinyllama descargado exitosamente"
    else
        echo "❌ Error descargando tinyllama, intentando con modelo mínimo..."
        
        # Modelos alternativos más ligeros
        if /bin/ollama pull llama2-uncensored:7b; then
            echo "✅ llama2-uncensored:7b descargado como alternativa"
        else
            echo "⚠️ No se pudo descargar ningún modelo"
        fi
    fi
fi

# Limpiar modelos pesados si existen
echo "🧹 Limpiando modelos pesados..."
if /bin/ollama list 2>/dev/null | grep -q "phi3:mini"; then
    echo "🗑️ Eliminando phi3:mini para ahorrar espacio..."
    /bin/ollama rm phi3:mini 2>/dev/null || true
fi

if /bin/ollama list 2>/dev/null | grep -q "phi3"; then
    echo "🗑️ Eliminando phi3 para ahorrar espacio..."
    /bin/ollama rm phi3 2>/dev/null || true
fi

echo "🎯 Estado final de modelos:"
/bin/ollama list 2>/dev/null || echo "ℹ️ No se pudieron listar modelos"

echo "🚀 Ollama listo y ejecutándose con modelos ligeros"
wait