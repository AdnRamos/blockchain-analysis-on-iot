FROM python:3.9-slim
WORKDIR /app

# Copia apenas os arquivos necessários
# Atenção: verifique se não há entradas em .dockerignore que excluam esses arquivos
COPY mini_factory_simulator.py ./
COPY requirements.txt ./
COPY simulators/ ./simulators/

# Debug: lista conteúdo de /app (descomentar para inspecionar)
RUN ls -R /app

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Executa o simulador
CMD ["python", "mini_factory_simulator.py"]