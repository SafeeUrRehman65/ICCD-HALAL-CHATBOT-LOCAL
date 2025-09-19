from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

wrapper = DuckDuckGoSearchAPIWrapper(max_results=2)

search = DuckDuckGoSearchRun(api_wrapper=wrapper)

response = search.invoke("Obama's first name?")

print("Response", response)