import os
import getpass
import traceback
from langchain_community.utilities import SQLDatabase
from typing_extensions import TypedDict,Annotated
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_ollama import ChatOllama
from langchain_together import ChatTogether
from dotenv import load_dotenv
from pydantic import BaseModel,Field
from langgraph.graph import START, StateGraph
from langchain_community.tools.sql_database.tool import QuerySQLDatabaseTool
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from fastapi import FastAPI, Query, HTTPException
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
from langchain_fireworks import ChatFireworks
from sqlalchemy import create_engine

# Initialize store for preserving chat history
store = {}
# Initialize components (same as yours)
app = FastAPI()
load_dotenv()

# db = SQLDatabase.from_uri("postgresql://postgres:safee@localhost:5432/postgres")


engine = create_engine("postgresql://postgres:safee@localhost:5432/postgres")

db = SQLDatabase(engine)
table_info = db.get_table_info()

# if not os.environ.get("TAVILY_API_KEY"):
#     os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")


if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Enter your Fireworks API key: ")


qa_llm = ChatFireworks(
    model="accounts/fireworks/models/kimi-k2-instruct",
    temperature=0,
)
top_k=2

# Improved System Message
system_message = """
You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run,
then look at the results of the query and return the answer. 
Unless the user
specifies a specific number of examples they wish to obtain, ALWAYS LIMIT YOUR QUERY TO ATMOST {top_k} results.
For greetings follow : {halal_db_greeting_prompt}
Here is the table_info : {table_info}

You can order the results by a relevant column to return the most interesting
examples in the database. Never query for all the columns from a specific table,
only ask for the relevant columns given the question.

You MUST double check your query before executing it. If you get an error while
executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the
database.

To start you should ALWAYS look at the tables in the database to see what you
can query. Do NOT skip this step.

If user asks irrelevant question, ALWAYS POLITELY DIRECT HIM TOWARDS YOUR PURPOSE WHICH IS TO QUERY PROVIDED DATABASE AND RETURN ANSWERS. 

Then you should query the schema of the most relevant tables.
""".format(
    dialect = db.dialect,
    top_k = 2,
    halal_db_greeting_prompt = halal_db_greeting_prompt,
    table_info = table_info
    )


# prompt = ChatPromptTemplate.from_messages([("system", system_message),("user","{input}"), MessagesPlaceholder("agent_scratchpad")
# ])


# prompt = ChatPromptTemplate.from_template("{input}")

toolkit = SQLDatabaseToolkit(db=db, llm=qa_llm)
tools = toolkit.get_tools()


# Initialize memory
memory = MemorySaver()
# FastAPI Endpoint
class QuestionRequest(BaseModel):
    question: str


agent_executor = create_react_agent(
    qa_llm,
    tools,
    prompt = system_message,
 )

 
# agent_executor = AgentExecutor(agent = agent, tools = tools, verbose = True)
config = {"configurable": {"thread_id": "xyz123"}}


@app.post("/invoke-graph")
def invoke_agent(question: QuestionRequest):
    input_message = {"role": "user", "content": question.question}

    response = agent_executor.invoke({"messages":[input_message]})

    return response
    # response = agent_executor.invoke({"input": question.question})

    # for step in agent_executor.stream(
    #     {"messages": [{"role": "user", "content": question}]},
        
    #     ):

    #     print(step)
        