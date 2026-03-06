import os
import sys
import asyncio
from typing import Any
import google.generativeai as genai
from mcp.server.stdio import stdio_server
from mcp.server import Server
from mcp.types import (
    Tool,
    TextContent,
    Prompt,
    PromptArgument,
    GetPromptResult,
    PromptMessage,
)
from mcp.server.models import InitializationOptions

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
    sys.exit(1)

genai.configure(api_key=api_key)

# Initialize the server
server = Server("gemini-31-pro-custom")

@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available tools."""
    return [
        Tool(
            name="generate_code",
            description="Generate clean, executable code based on a prompt using Gemini 3.1 Pro.",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {"type": "string", "description": "The coding task to perform."},
                },
                "required": ["prompt"],
            },
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict[str, Any] | None) -> list[TextContent]:
    """Handle tool execution."""
    if name == "generate_code":
        if not arguments or "prompt" not in arguments:
            return [TextContent(type="text", text="Error: Missing prompt argument")]
            
        prompt_text = arguments["prompt"]
        
        # Using the model specified by the user
        try:
            model = genai.GenerativeModel("gemini-2.0-flash-exp") # Falling back to a known working one if 3.1 is not found?
            # Actually, let's try to use the one the user requested if possible, or 2.0 Flash which is very fast and capable.
            # The user asked for gemini-3.1-pro-exp-1217.
            model_name = "gemini-3.1-pro-exp-1217"
            
            # Check if model exists or just try it
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction="You are an expert coding agent. Respond with clean, executable code."
            )
            
            response = model.generate_content(prompt_text)
            return [TextContent(type="text", text=response.text)]
        except Exception as e:
            # If the specific model fails (e.g. not available in this region or API key doesn't have access)
            # we can try a fallback or just report the error.
            return [TextContent(type="text", text=f"Error calling Gemini: {str(e)}")]
            
    raise ValueError(f"Unknown tool: {name}")

@server.list_prompts()
async def handle_list_prompts() -> list[Prompt]:
    """List available prompts."""
    return [
        Prompt(
            name="code_assistant",
            description="A prompt for generating code.",
            arguments=[
                PromptArgument(
                    name="task",
                    description="The coding task to perform.",
                    required=True
                )
            ]
        )
    ]

@server.get_prompt()
async def handle_get_prompt(name: str, arguments: dict[str, str] | None) -> GetPromptResult:
    """Handle prompt generation."""
    if name == "code_assistant":
        task = arguments.get("task") if arguments else "Help me write some code."
        return GetPromptResult(
            description="Coding assistant prompt",
            messages=[
                PromptMessage(
                    role="user",
                    content=TextContent(type="text", text=f"You are an expert coding agent. Respond with clean, executable code.\n\nTask: {task}")
                )
            ]
        )
    raise ValueError(f"Unknown prompt: {name}")

async def main():
    import mcp.types as types
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="gemini-31-pro-custom",
                server_version="0.1.0",
                capabilities=types.ServerCapabilities(
                    prompts=types.PromptsCapability(listChanged=True),
                    tools=types.ToolsCapability(listChanged=True),
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
