import streamlit as st
import requests
import json

st.title("Chatbot con 3 Agentes")

st.write("Interfaz para probar la API de Django con agentes de vista, modelo y base de datos.")

user_id = st.text_input("User ID", value="test")
message = st.text_area("Mensaje", value="Hola, ¿cómo estás?")

if st.button("Enviar"):
    if user_id and message:
        url = "http://localhost:8000/api/chat/"
        data = {"user_id": user_id, "message": message}
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(url, data=json.dumps(data), headers=headers)
            if response.status_code == 200:
                reply = response.json().get("reply", "No reply")
                st.success(f"Respuesta: {reply}")
            else:
                st.error(f"Error: {response.status_code} - {response.text}")
        except Exception as e:
            st.error(f"Error de conexión: {e}")
    else:
        st.warning("Por favor, ingresa User ID y Mensaje.")