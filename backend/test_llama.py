import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from chat.agents.llama_cloud_agent import LlamaCloudAgent

agent = LlamaCloudAgent()
result = agent.parse_file("./attention_is_all_you_need.pdf")
print("Full markdown:")
print(result.markdown_full)
print("\nFull text:")
print(result.text_full)