import os
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


# Initialize store for preserving chat history
store = {}
# Initialize components (same as yours)
app = FastAPI()
load_dotenv()
db = SQLDatabase.from_uri("postgresql://postgres:safee@localhost:5432/postgres")

# LLM Setup (same as yours)
qa_llm = ChatTogether(
    model="meta-llama/Llama-3-70b-chat-hf",
    temperature=0,
    api_key=os.getenv("TOGETHER_AI_API_KEY"),
    max_tokens=None
)

# meta-llama/Llama-3.3-70B-Instruct-Turbo-Free

# Qwen/Qwen3-235B-A22B-Thinking-2507
table_info=db.get_table_info(),
top_k=2

# Improved System Message
system_message = f"""
<<ROLE>>
You Halal Bot, a specialized AI assistant for Halal Food Thailand database.

<<CAPABILITIES>>
1. Answer database queries about halal products
2. Explain halal certification
3. Handle general conversation and provide general purpose information and 

<<DATABASE SCHEMA>>
{table_info}

<<RULES>>
- For greetings follow this : {halal_db_greeting_prompt}
- For halal questions: Provide accurate information
- For database queries: Always verify SQL syntax
- Always answer query specific questions by querying database, DO NOT hallucinate
- Never modify data (INSERT/UPDATE/DELETE)
- Limit to {top_k} results unless specified
- Always use optimized and fast queries, use indexing if required to get faster responses.
"""


# # construct a prompt template
# prompt = hub.pull("hwchase17/openai-functions-agent")
# print(prompt.messages)
# Create the agent

# agent_prompt = ChatPromptTemplate.from_messages([
#     ("system", system_message),  # Your custom system message
#     MessagesPlaceholder("messages"),  # For conversation history
# ])
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
    prompt= system_message,
    checkpointer= memory
 )

config = {"configurable": {"thread_id": "xyz123"}}

# @app.post("/invoke-graph")
# def invoke_agent(question: QuestionRequest):
#     all_messages = []
#     for step in agent_executor.stream(
#         {"messages": [{"role": "user", "content": question.question}]},
#         stream_mode="values",
#     ):
#         all_messages.append(step["messages"][-1])
#     if all_messages:
#         return all_messages[-1]


@app.post("/invoke-graph")
def invoke_agent(question: QuestionRequest):
    input_message = {"role": "user", "content": question.question}
    response = agent_executor.invoke({"messages":[input_message]}, config)
    return response 