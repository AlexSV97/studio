import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from dotenv import load_dotenv

load_dotenv()

class ModelAgent:
    def __init__(self, model_name="microsoft/DialoGPT-small"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.pipe = pipeline("text-generation", model=self.model, tokenizer=self.tokenizer)

    def build_prompt(self, user_message, context):
        return f"{context}\nUsuario: {user_message}\nAgente:"

    def generate(self, prompt):
        # Encode the prompt
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt")
        # Generate response
        output = self.model.generate(input_ids, max_new_tokens=50, do_sample=True, temperature=0.7, pad_token_id=self.tokenizer.eos_token_id)
        # Decode the response
        response = self.tokenizer.decode(output[0], skip_special_tokens=True)
        # Extract after "Agente:"
        if "Agente:" in response:
            return response.split("Agente:")[-1].strip()
        else:
            return response[len(prompt):].strip()