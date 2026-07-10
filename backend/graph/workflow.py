from langgraph.graph import StateGraph, END

from models.schemas import SharedState

from agents.repository_agent import repository_understanding_agent
from agents.architecture_agent import architecture_agent
from agents.bug_agent import bug_agent
from agents.best_practice_agent import best_practice_agent
from agents.formatter_agent import response_formatter


def build_graph():
    graph = StateGraph(SharedState)

    graph.add_node(
        "repository_understanding_agent",
        repository_understanding_agent,
    )

    graph.add_node(
        "architecture_agent",
        architecture_agent,
    )

    graph.add_node(
        "bug_agent",
        bug_agent,
    )

    graph.add_node(
        "best_practice_agent",
        best_practice_agent,
    )

    graph.add_node(
        "response_formatter",
        response_formatter,
    )

    graph.set_entry_point(
        "repository_understanding_agent"
    )

    graph.add_edge(
        "repository_understanding_agent",
        "architecture_agent",
    )

    graph.add_edge(
        "architecture_agent",
        "bug_agent",
    )

    graph.add_edge(
        "bug_agent",
        "best_practice_agent",
    )

    graph.add_edge(
        "best_practice_agent",
        "response_formatter",
    )

    graph.add_edge(
        "response_formatter",
        END,
    )

    return graph.compile()


COMPILED_GRAPH = build_graph()