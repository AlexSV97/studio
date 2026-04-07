import streamlit as st
import requests
import json

st.title("Chatbot con 3 Agentes + Llama Cloud")

st.write("Interfaz para probar la API de Django con agentes de vista, modelo, base de datos y parsing de PDFs.")

user_id = st.text_input("User ID", value="test")
message = st.text_area("Mensaje", value="¿Qué dice el PDF sobre atención?")
pdf_path = st.text_input("Path al PDF (opcional)", value="./backend/context/attention_is_all_you_need.pdf")

if st.button("Enviar"):
    if user_id and message:
        url = "http://localhost:8000/api/chat/"
        data = {"user_id": user_id, "message": message}
        if pdf_path:
            data["pdf_path"] = pdf_path
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