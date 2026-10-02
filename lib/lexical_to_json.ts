import { createEditor, SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { nodes } from '@/components/blocks/editor-x/nodes';
import { editorConfig } from '@/components/blocks/editor-x/editor';
import { $generateHtmlFromNodes } from '@lexical/html';

/**
 * Converts Lexical JSON to HTML using Lexical's built-in utilities
 * @param lexicalJson - The Lexical JSON object (serialized editor state)
 * @returns The HTML string
 */
export function lexicalToHtml(lexicalJson: SerializedEditorState<SerializedLexicalNode>): string {
    if (!lexicalJson || !lexicalJson.root) {
        return '';
    }

    try {
        // Create an editor using the standard createEditor from lexical
        // This avoids type compatibility issues with the headless editor
        const templateEditor = createEditor({
            namespace: 'EmailTemplate',
            nodes: nodes,
            theme: editorConfig.theme,
            onError: (error) => {
                console.error('Lexical Editor Error:', error);
            },
        });

        // Set the editor state from the provided JSON
        templateEditor.setEditorState(
            templateEditor.parseEditorState(lexicalJson)
        );

        // Generate HTML from the editor state
        let html = '';

        // We need to use read() to access the editor state safely
        templateEditor.read(() => {
            html = $generateHtmlFromNodes(templateEditor);
        });

        return html;
    } catch (error) {
        console.error('Error converting Lexical JSON to HTML:', error);
        return '';
    }
}