from crewai_tools import tool
from exa_py import Exa
from crewai import Task, Crew, Agent
import os

exa_api_key = os.getenv("EXA_API_KEY")

@tool("Exa search and get contents")
def search_and_get_contents_tool(question: str) -> str:
    """Tool using Exa's Python SDK to run semantic search and return result highlights."""

    exa = Exa(exa_api_key)

    response = exa.search_and_contents(
        question,
        type="neural",
        num_results=3,
        highlights=True
    )

    parsedResult = ''.join([
        f'<Title id={idx}>{eachResult.title}</Title>'
        f'<URL id={idx}>{eachResult.url}</URL>'
        f'<Highlight id={idx}>{".".join(eachResult.highlights)}</Highlight>'
        for (idx, eachResult) in enumerate(response.results)
    ])

    return parsedResult

# Define the tools
exa_tools = search_and_get_contents_tool

# Create agents
researcher = Agent(
    role='Researcher',
    goal='Get the latest research on {topic}',
    verbose=True,
    memory=True,
    backstory=(
        "Driven by curiosity, you're at the forefront of "
        "innovation, eager to explore and share knowledge that could change "
        "the world."
    ),
    tools=[exa_tools],
    allow_delegation=False
)

article_writer = Agent(
    role='Writer',  # Fixed role name from 'Researcher' to 'Writer'
    goal='Write a great newsletter article on {topic}',
    verbose=True,
    memory=True,
    backstory=(
        "Driven by a love of writing and passion for "
        "innovation, you are eager to share knowledge with "
        "the world."
    ),
    tools=[exa_tools],
    allow_delegation=False
)

# Define tasks
research_task = Task(
    description=(
        "Identify the latest research in {topic}. "
        "Your final report should clearly articulate the key points."
    ),
    expected_output='A comprehensive 3 paragraphs long report on the {topic}.',
    tools=[exa_tools],
    agent=researcher,
)

write_article = Task(
    description=(
        "Write a newsletter article on the latest research in {topic}. "
        "Your article should be engaging, informative, and accurate. "
        "The article should address the audience with a greeting to the newsletter audience \"Hi readers!\", plus a similar signoff"
    ),
    expected_output='A comprehensive 3 paragraphs long newsletter article on the {topic}.',
    agent=article_writer,
)

# Create crew
crew = Crew(
    agents=[researcher, article_writer],
    tasks=[research_task, write_article],
    memory=True,
    cache=True,
    max_rpm=100,
    share_crew=True
)

def main():
    # Kick off the crew with a specific topic
    response = crew.kickoff(inputs={'topic': 'Latest AI research'})
    print(response)

if __name__ == "__main__":
    main()