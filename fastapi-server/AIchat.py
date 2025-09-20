import os
import getpass
import traceback
from langchain_community.utilities import SQLDatabase
from starlette.types import Lifespan
from typing_extensions import TypedDict,Annotated
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_ollama import ChatOllama
from langchain_together import ChatTogether
from dotenv import load_dotenv
from pydantic import BaseModel,Field
from langgraph.graph import START, END, StateGraph, MessagesState
from langchain_community.tools.sql_database.tool import QuerySQLDatabaseTool
from langchain_core.messages import HumanMessage,SystemMessage, trim_messages
from langgraph.prebuilt import create_react_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from fastapi import FastAPI, Query, HTTPException
from mangum import Mangum
from prompts import halal_db_prompt, halal_db_greeting_prompt
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langgraph.checkpoint.memory import MemorySaver
from langchain import hub
from langchain_cohere import ChatCohere, create_cohere_react_agent
from langchain_cohere.llms import Cohere
from langchain_cerebras import ChatCerebras
from langchain_tavily import TavilySearch
from langchain.agents import AgentExecutor
from langchain_core.tools import tool
from langchain_core.messages.utils import count_tokens_approximately
from langchain_fireworks import ChatFireworks
from sqlalchemy import create_engine
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
from langgraph.prebuilt import ToolNode
# Initialize store for preserving chat history
store = {}
# Initialize components (same as yours)
fast_app = FastAPI()
load_dotenv()

# db = SQLDatabase.from_uri("postgresql://postgres:safee@localhost:5432/postgres")


engine = create_engine("postgresql://postgres:safee@localhost:5432/postgres")

# db = SQLDatabase(engine)
# table_info = db.get_table_info()


qa_llm = ChatFireworks(
    api_key = os.getenv("FIREWORKS_AI_API_KEY"),
    model="accounts/fireworks/models/kimi-k2-instruct",
    temperature=0,
)
top_k=2

system_message_global = """
You are a helpful assistant whose purpose role is to assist the users on a broad category of Halal related mattters. User can ask you about halal certification of certain products given their barcode, halal code, fda_number, etc.

**CAPABILITIES**
- Assist users about a broad range of halal related matters.
- Respond to certain halal product queries including but not limited to food, beverages, ingredients, cosmetics, tourism, etc.
- Able to search the internet provided the tools and answer user queries.
- Can respond in different languages including but not limited to English, Arabic and French.
- Respond in a conversational and polite tone.

**GUIDELINES""
- For greetings follow this : {halal_db_greeting_prompt}
- RESPONSES SHOULD BE SHORT, CONCISE AND TO THE POINT.
- CALL TOOLS FOR QUERIES WHICH REQUIRE ONE.
- YOUR RESPONSE SHOULD NOT EXCEED 4 SENTENCES.
- DO NOT hallucinate and provide information only from trusted and authentic sources.
- If user query requires searching the internet, only do then, DO NOT initiate internet searches for queries that do not require one.
- Respond in the same language in which the user asks a question.
- Always ask follow-up questions after providing a response.
- 
- If user ask irrelevant questions which conflict your purpose, politely respond him to your specific purpose.
""".format(
    halal_db_greeting_prompt = halal_db_greeting_prompt 
)


# Define a new graph
workflow = StateGraph(state_schema = MessagesState)

prompt_template = ChatPromptTemplate.from_messages(
    [("system", system_message_global),
    MessagesPlaceholder(variable_name = "messages")]

)

trimmer = trim_messages(
        max_tokens = 500,
        strategy="last",
        token_counter = count_tokens_approximately,
        include_system = True,
        start_on = "human",
)

def tool_or_normal(state: MessagesState):
    messages = state["messages"]
    last_message = messages[-1]

    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        print("-------------tool calls----------------")
        print("Message which needed tool_calls", last_message)
        return "tools"
    
    return "end"

# define the function that calls the llm
def call_model(state: MessagesState):
    trimmed_messages = trimmer.invoke(state["messages"])
    print("Remaining trimmed messages:")

    for msg in trimmed_messages:
        print(f"{type(msg).__name__}: {msg.content}")
        print("------------------------------------")
    prompt = prompt_template.invoke(
        {"messages": trimmed_messages}
    )     
    response = qa_llm_with_tools.invoke(prompt)
    print("The chat's response", response)
    return {"messages": [response]}



# toolkit = SQLDatabaseToolkit(db=db, llm=qa_llm)
# tools = toolkit.get_tools()



wrapper = DuckDuckGoSearchAPIWrapper(max_results=5)

duck_duck_go_search = DuckDuckGoSearchRun(api_wrapper=wrapper)

# Initiate tavily search tool
# tavily_search = TavilySearch(
#     tavily_api_key = os.getenv("TAVILY_SEARCH_API_KEY"),
#     max_results = 2,
#     topic = "general"
# )

tools = []
duck_node = ToolNode(tools)


# initialize qa_llm with the tavily search tool
qa_llm_with_tools = qa_llm.bind_tools(tools)
# Initialize memory
memory = MemorySaver()
# FastAPI Endpoint
class QuestionRequest(BaseModel):
    question: str

config = {"configurable": {"thread_id": "xyz123"}}

# compile workflow with nodes and edges
workflow.add_node("model", call_model )
workflow.add_node("tavily_tool_call_node", duck_node)

workflow.add_edge(START, "model")

workflow.add_conditional_edges(
    "model",
    tool_or_normal,{
        "tools": "tavily_tool_call_node",
        "end": END
    }
)

workflow.add_edge("tavily_tool_call_node", "model")

# compile the graph
app = workflow.compile(checkpointer = memory)


@fast_app.post("/invoke-graph")
def invoke_agent(question: QuestionRequest):

    query = question.question

    input_messages = [HumanMessage(query)]

    output = app.invoke({"messages": input_messages}, config)
    print("output", output)
    response = output["messages"][-1].content
    return output


# agent_executor = create_react_agent(
#     qa_llm,
#     [tavily_search],
#     prompt = system_message_global,
#     checkpointer = memory
#  )

# input_message = {
#     "role": "user",
#     "content": "Le chocolat mars est-il halal?",
# }


# # agent_executor = AgentExecutor(agent = agent, tools = tools, verbose = True)

# @app.post("/invoke-graph")
# def invoke_agent(question: QuestionRequest):
    
#     # initiate the message trimmer
    

#     response = agent_executor.invoke({"messages":messages_for_invoke}, config)

#     return response
    
#     # for step in agent_executor.stream(
#     #     {"messages": [{"role": "user", "content": question}]},
        
#     #     ):

#     #     print(step)

handler = Mangum(app, lifespan= 'off')