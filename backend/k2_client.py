import os
import json
import re
import httpx
from typing import Dict, Any
from dotenv import load_dotenv
from scenario_response import _generate_scenario_aware_response

load_dotenv()

K2_API_KEY = os.getenv("K2_API_KEY", "")
K2_API_URL = os.getenv("K2_API_URL", "https://api.k2think.ai/v1/chat/completions")
K2_MODEL = os.getenv("K2_MODEL", "MBZUAI-IFM/K2-Think-v2")


def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Extract JSON from K2's text response"""
    
    text = text.strip()
    
    # 1. Try direct parse
    try:
        return json.loads(text)
    except:
        pass
    
    # 2. Try JSON in code blocks
    match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', text)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    
    # 3. Look for JSON object with proper brace matching
    # Find "plans" and work from there
    plans_match = re.search(r'"plans"\s*:\s*\[', text)
    if plans_match:
        # Find the opening brace before "plans"
        start = text.rfind('{', 0, plans_match.start())
        if start >= 0:
            # Try progressively larger chunks until valid JSON
            for end in range(plans_match.end(), len(text)):
                if text[end] == '}':
                    try:
                        candidate = text[start:end+1]
                        parsed = json.loads(candidate)
                        if "plans" in parsed and "comparison" in parsed:
                            return parsed
                    except json.JSONDecodeError:
                        continue
    
    # 4. If all fails, return None to trigger fallback
    return None


class K2Client:
    def __init__(self, api_key: str = None, api_url: str = None, model: str = None):
        self.api_key = api_key or K2_API_KEY
        self.api_url = api_url or K2_API_URL
        self.model = model or K2_MODEL
        self.timeout = 120.0

    async def reason(self, prompt: str) -> Dict[str, Any]:
        from reasoning import SYSTEM_PROMPT, BOOSTER_PROMPT
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt + BOOSTER_PROMPT},
            ],
            "temperature": 0.0,
            "max_tokens": 4096,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            print(f"[K2] Sending request to {self.api_url}")
            response = await client.post(self.api_url, headers=headers, json=payload)
            print(f"[K2] Response status: {response.status_code}")
            response.raise_for_status()
            data = response.json()
            print(f"[K2] Response keys: {data.keys()}")

        content = data["choices"][0]["message"]["content"]
        print(f"[K2] Content length: {len(content)}")
        
        # Try to extract JSON from the response
        result = extract_json_from_text(content)
        if result:
            print("[K2] Successfully extracted JSON from response!")
            return result
        
        # If extraction failed, show what we got and use fallback
        print(f"[K2] Could not extract JSON. Preview: {content[:500]}...")
        raise ValueError("Could not parse JSON from K2 response")

    async def reason_with_fallback(self, prompt: str, base_scenario: Dict[str, Any] = None) -> Dict[str, Any]:
        try:
            if not self.api_key or self.api_key in ("your-api-key-here", ""):
                print("[K2] Using scenario-aware mock response (no API key)")
                return _generate_scenario_aware_response(base_scenario) if base_scenario else _generate_scenario_aware_response({"aircraft_type": "A320"})
            print(f"[K2] Calling API...")
            result = await self.reason(prompt)
            print("[K2] API call successful")
            return result
        except Exception as e:
            print(f"[K2] API/extraction error: {e}")
            return _generate_scenario_aware_response(base_scenario) if base_scenario else _generate_scenario_aware_response({"aircraft_type": "A320"})
