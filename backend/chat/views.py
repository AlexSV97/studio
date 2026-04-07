from rest_framework.views import APIView
from rest_framework.response import Response
from .agents.db_agent import DatabaseAgent
from .agents.model_agent import ModelAgent

class ChatAPIView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        message = request.data.get("message")

        if not user_id or not message:
            return Response({"error": "user_id and message required"}, status=400)

        db = DatabaseAgent()
        context = db.get_conversation_context(user_id)

        model = ModelAgent()
        prompt = model.build_prompt(message, context)
        response_text = model.generate(prompt)

        db.save_message(user_id, message, response_text)
        return Response({"reply": response_text})
