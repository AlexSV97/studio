import asyncio
import os
from dotenv import load_dotenv
from llama_cloud import AsyncLlamaCloud

load_dotenv()

class LlamaCloudAgent:
    def __init__(self):
        self.api_key = os.getenv("LLAMA_CLOUD_API_KEY")
        if not self.api_key:
            raise ValueError("LLAMA_CLOUD_API_KEY no está definido en el .env")
        self.client = AsyncLlamaCloud(api_key=self.api_key)

    async def _parse_file_async(self, file_path, tier="agentic", version="latest", expand=None):
        if expand is None:
            expand = ["markdown_full", "text_full"]

        file_obj = await self.client.files.create(file=file_path, purpose="parse")
        result = await self.client.parsing.parse(
            file_id=file_obj.id,
            tier=tier,
            version=version,
            expand=expand,
        )
        return result

    def parse_file(self, file_path, tier="agentic", version="latest", expand=None):
        return asyncio.run(self._parse_file_async(file_path, tier=tier, version=version, expand=expand))

    def close(self):
        try:
            asyncio.run(self.client.close())
        except RuntimeError:
            pass
