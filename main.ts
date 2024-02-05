import { Editor, MarkdownView, Notice, Plugin, } from 'obsidian';

export default class StripLinks extends Plugin {
	async onload() {
		this.addCommand({
			id: 'strip-links-from-selection',
			name: 'Selection (to clipboard)',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				if (checking) {
					return editor.getSelection().length > 0;
				}
				const text = editor.getSelection();

				if (text.length === 0) {
					new Notice("Cannot strip internal links from selection: selection empty")
					return;
				}
				const strippedText = this.stripText(text);
				
				navigator.clipboard.writeText(strippedText);
				new Notice("Selection copied with internal links stripped");
			}
		});

		this.addCommand({
			id: 'strip-links-entire-file',
			name: 'Entire file (to clipboard)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const text = editor.getValue();
				const strippedText = this.stripText(text);
				navigator.clipboard.writeText(strippedText);
				new Notice("File copied with internal links stripped");
			}
		});

		this.addCommand({
			id: 'strip-links-from-selection-in-place',
			name: 'Selection (in place)',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				if (checking) {
					return editor.getSelection().length > 0;
				}
				const text = editor.getSelection();
				if (text.length === 0) {
					new Notice("Cannot strip internal links from selection: selection empty")
					return;
				}
				const strippedText = this.stripText(text);
				editor.replaceSelection(strippedText);
			}
		});

		this.addCommand({
			id: 'strip-links-entire-file-in-place',
			name: 'Entire file (in place)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const text = editor.getValue();
				const strippedText = this.stripText(text);
				editor.setValue(strippedText);
			}
		});
	}

	stripText(s: string) {
		// Strip out the internal links from the selection:
		// [[link|text]] -> text
		// [[text]] -> text
		return s
			.replace(/\[\[([^[\]]*?)\|([^[\]]*?)\]\]/g, '$2') // [[link|text]] -> text
			.replace(/\[\[([^[\]]*?)\]\]/g, '$1') // [[text]] -> text
			.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, link) => {
				// [text](internal%20link) -> text (unless the link is to an external URI of some sort)
				// External is anything matching "text:"
				// This seems to be consistent with how Obsidian handles external links
				if (!link.match(/[a-z0-9]+:/)) {
					return text;
				}
				return match;
			});
	}
}
