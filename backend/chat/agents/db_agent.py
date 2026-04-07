import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseAgent:
    def __init__(self):
        # Simular dataset para pruebas; reemplaza con carga real si el dataset existe
        self.memory = {}  # Dict para almacenar conversaciones por user_id

    def get_conversation_context(self, user_id):
        # Retornar contexto simulado o vacío
        return self.memory.get(user_id, "")

    def save_message(self, user_id, user_text, bot_text):
        # Guardar en memoria (en producción, usa DB)
        if user_id not in self.memory:
            self.memory[user_id] = ""
        self.memory[user_id] += f"Usuario: {user_text}\nAgente: {bot_text}\n"