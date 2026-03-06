import { Client } from "@notionhq/client";

export async function runPluginAction(action: string, params: any) {
    if (action === "update_notion_db") {
        const notionApiKey = process.env.NOTION_API_KEY;
        const databaseId = process.env.NOTION_DATABASE_ID || params.database_id;

        if (!notionApiKey) {
            throw new Error("Missing NOTION_API_KEY in environment.");
        }

        if (!databaseId) {
            throw new Error("Missing NOTION_DATABASE_ID in environment or params.");
        }

        const notion = new Client({ auth: notionApiKey });

        try {
            // Basic implementation for a CRM log
            // Parameters expect a "title" and a "content" field
            const response = await notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    "Name": {
                        title: [
                            {
                                text: {
                                    content: params.title || "Nouvel Appel CRM",
                                },
                            },
                        ],
                    },
                },
                children: [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: params.content || "Aucune note fournie.",
                                    },
                                },
                            ],
                        },
                    },
                ],
            });

            return {
                success: true,
                pageId: response.id,
                url: (response as any).url,
            };
        } catch (e: any) {
            return {
                success: false,
                error: e.message,
            };
        }
    }

    throw new Error(`Unknown action: ${action}`);
}
