# Directory: exa_summary_agent/
# File: agent.py

import os
import textwrap
from openai import OpenAI
from exa_py import Exa
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

class ExaSummarizationAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.exa = Exa(api_key=os.getenv("EXA_API_KEY"))

    def summarize_recent_articles(self, user_question: str, num_articles: int = 3):
        # Step 1: Generate search query
        SYSTEM_MESSAGE_QUERY = "You are a helpful assistant that generates search queries based on user questions. Only generate one search query."

        completion = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_MESSAGE_QUERY},
                {"role": "user", "content": user_question},
            ]
        )
        search_query = completion.choices[0].message.content.strip()

        # Step 2: Search Exa
        one_week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        search_response = self.exa.search_and_contents(search_query, start_published_date=one_week_ago, num_results=num_articles)
        results = search_response.results

        summaries = []
        SYSTEM_MESSAGE_SUMMARY = "You are a helpful assistant that summarizes the content of an article in a concise, clear format suitable for a podcast narration."

        for i, result in enumerate(results, 1):
            if not result.text.strip():
                continue
            summary_completion = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": SYSTEM_MESSAGE_SUMMARY},
                    {"role": "user", "content": result.text},
                ],
            )
            summary = summary_completion.choices[0].message.content.strip()
            summaries.append(f"{i}. {result.title}\n{result.url}\n{textwrap.fill(summary, 80)}\n")

        return "\n\n".join(summaries) if summaries else "No summarizable articles found."

def test_summarization():
    try:
        print("\n=== Testing ExaSummarizationAgent ===\n")
        agent = ExaSummarizationAgent()
        test_query = "Latest developments in artificial intelligence and machine learning"
        print("Query:", test_query)
        print("Number of articles:", 2)
        print("\nFetching and summarizing articles...\n")
        result = agent.summarize_recent_articles(test_query, num_articles=2)
        print("Results:\n")
        print(result)
        print("\n=== Test completed successfully ===\n")
    except Exception as e:
        print(f"\nError during test: {str(e)}\n")
        print("Please ensure you have set up the following environment variables:")
        print("- OPENAI_API_KEY")
        print("- EXA_API_KEY")

if __name__ == "__main__":
    test_summarization()