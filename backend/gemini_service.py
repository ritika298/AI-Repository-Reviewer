import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create model
model = genai.GenerativeModel("gemini-2.5-flash")


def review_code(code):

    prompt = f"""
You are an experienced C++ Code Reviewer.

Your job is to review the given code exactly like a senior software engineer.

Return ONLY valid JSON.

Use EXACTLY this structure:

{{
  "summary": "",
  "health_status": "",
  "complexity": {{
      "time": "",
      "space": ""
  }},
  "bugs": [],
  "suggestions": [],
  "fixed_code": ""
}}

Rules:

1. Summary
- Maximum 2 sentences.
- Explain what the code does.
2. Health Status
Choose ONLY one:
🟢 Healthy
🟡 Warning
🔴 Critical

Rules:
🟢 Healthy
No bugs and code quality is acceptable.

🟡 Warning
Code works but has style issues, poor practices or minor mistakes.

🔴 Critical
Contains bugs, crashes, undefined behaviour or incorrect logic.

3. Complexity

Return only:

"time": "O(...)"
"space": "O(...)"

4. Bugs

List ONLY actual bugs.

Do NOT list coding style issues.

If no bugs exist:

["No critical bugs found."]

5. Suggestions

Return between 2 and 5 concise suggestions.

Each suggestion should be one sentence.

Examples:

"Add return 0 from main."

"Avoid using namespace std."

"Prefer std::endl after console output."

6. Fixed Code

Return the complete improved C++ program.

Do not explain anything.

Do not use markdown.

Do not use ```.

Return ONLY the JSON object.

Code:

{code}
"""

    response = model.generate_content(prompt)

    return json.loads(response.text)