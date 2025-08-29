"use client"

import { $createParagraphNode, $createTextNode, $getRoot, $insertNodes, SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { nodes } from '@/components/blocks/editor-x/nodes';
import { editorConfig } from '@/components/blocks/editor-x/editor';
import { $generateNodesFromDOM } from '@lexical/html';
import { createHeadlessEditor } from '@lexical/headless';

export function htmlToLexical(html: string): SerializedEditorState<SerializedLexicalNode> | undefined {
    if (!html || html.trim() === "" || typeof window === "undefined") {
        return undefined;
    }

    try {
        // Create an editor using the standard createEditor from lexical
        // This avoids type compatibility issues with the headless editor
        const templateEditor = createHeadlessEditor({
            namespace: 'ContentTemplate',
            nodes: nodes,
            theme: editorConfig.theme,
            onError: (error) => {
                console.error("🚀 ~ htmlToLexical ~ error:", error)
            },
        });

        templateEditor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, "text/html");

            const lexicalNodes = $generateNodesFromDOM(templateEditor, dom);

            const root = $getRoot();
            root.clear();

            if (lexicalNodes.length > 0) {
                $insertNodes(lexicalNodes);
            } else {
                // fallback kalau parsing kosong
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(""));
                root.append(paragraph);
            }
        }, {
            discrete: true
        });

        return templateEditor.getEditorState().toJSON();
    } catch (error) {
        console.log("🚀 ~ Error converting Lexical JSON to HTML ~ htmlToLexical ~ error:", error)
        return undefined;
    }
}
