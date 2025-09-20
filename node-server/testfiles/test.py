import os
import getpass
from sqlalchemy import create_engine
from langchain_fireworks import Fireworks, ChatFireworks
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
from prompts import halal_db_prompt, halal_db_greeting_prompt
from langchain_experimental.sql import SQLDatabaseChain


engine = create_engine("postgresql://postgres:safee@localhost:5432/postgres")
db = SQLDatabase(engine)


load_dotenv()
# Step 1: Set Fireworks API key
if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Enter your Fireworks API key: ")

# Step 2: Initialize Fireworks LLM
qa_llm = ChatFireworks(
    model="accounts/fireworks/models/llama-v3p1-8b-instruct",
    temperature=0,
    max_tokens=150,
)

system_message = """
You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run,
then look at the results of the query and return the answer. Unless the user
specifies a specific number of examples they wish to obtain, always limit your
query to at most {top_k} results.
For greetings follow : {halal_db_greeting_prompt}
You should also answer questions that doesn't require querying the database in a polite and conversational tone.

You can order the results by a relevant column to return the most interesting
examples in the database. Never query for all the columns from a specific table,
only ask for the relevant columns given the question.

You MUST double check your query before executing it. If you get an error while
executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the
database.

To start you should ALWAYS look at the tables in the database to see what you
can query. Do NOT skip this step.

Then you should query the schema of the most relevant tables.
""".format(
    dialect = db.dialect,
    top_k = 2,
    halal_db_greeting_prompt = halal_db_greeting_prompt
    )

prompt = ChatPromptTemplate.from_messages([("system", system_message),("user","{input}")
])


db_chain = SQLDatabaseChain.from_llm(qa_llm, db,prompt = prompt)
# Step 6: Query the agent
# query = "How many records are there in the halal food thailand table?"
query = "Hey chat"

answer = db_chain.invoke({"query": query})
print("Answer: ", answer)