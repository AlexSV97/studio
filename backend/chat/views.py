from rest_framework.views import APIView
from rest_framework.response import Response
from .agents.db_agent import DatabaseAgent
from .agents.model_agent import ModelAgent
from .agents.llama_cloud_agent import LlamaCloudAgent

class ChatAPIView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        message = request.data.get("message")
        pdf_path = request.data.get("pdf_path")  # Opcional: path al PDF en el servidor

        if not user_id or not message:
            return Response({"error": "user_id and message required"}, status=400)

        db = DatabaseAgent()
        context = db.get_conversation_context(user_id)

        # Si se proporciona un PDF, parsearlo y agregarlo al contexto
        if pdf_path:
            try:
                llama_agent = LlamaCloudAgent()
                parsed_result = llama_agent.parse_file(pdf_path)
                pdf_content = parsed_result.text_full[:2000]  # Limitar a 2000 chars
                context += f"\nContenido del PDF:\n{pdf_content}\n"
            except Exception as e:
                return Response({"error": f"Error parsing PDF: {str(e)}"}, status=500)

        model = ModelAgent()
        prompt = model.build_prompt(message, context)
        response_text = model.generate(prompt)

        db.save_message(user_id, message, response_text)
        return Response({"reply": response_text})
