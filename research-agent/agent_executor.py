from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.types import TextPart, Part, Task, UnsupportedOperationError, InvalidParamsError
from a2a.utils import completed_task, new_artifact
from a2a.utils.errors import ServerError
from agent import ExaSummarizationAgent

class ExaSummarizationExecutor(AgentExecutor):
    def __init__(self):
        self.agent = ExaSummarizationAgent()

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        error = self._validate_request(context)
        if error:
            raise ServerError(error=InvalidParamsError())

        query = context.get_user_input()
        try:
            result = self.agent.summarize_recent_articles(query)
        except Exception as e:
            raise ServerError(error=ValueError(f"Error invoking agent: {e}"))

        await event_queue.enqueue_event(
            completed_task(
                context.task_id,
                context.context_id,
                [new_artifact([Part(root=TextPart(result))], f"summary_{context.task_id}")],
                [context.message],
            )
        )

    async def cancel(self, request: RequestContext, event_queue: EventQueue) -> Task | None:
        raise ServerError(error=UnsupportedOperationError())

    def _validate_request(self, context: RequestContext) -> bool:
        return False
