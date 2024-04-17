import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { randomBytes } from 'crypto';

interface HashPluginSettings {
	size: string;
}

const DEFAULT_SETTINGS: HashPluginSettings = {
	size: '6'
}

export default class HashPlugin extends Plugin {
	settings: HashPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('braces', 'Obsidian Hash', (evt: MouseEvent) => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) {
        this.generateHash(view.editor)
      }
		});
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('obsidian-hash-ribbon-class');

		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'generate-hash',
			name: 'Generate hash',
      editorCallback: (editor: Editor) => this.generateHash(editor)
		});
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HashSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

  generateHash(editor: Editor) {
    return editor.replaceRange(
      randomBytes(Number(this.settings.size)).toString('hex'),
      editor.getCursor()
    )
  }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class HashSettingTab extends PluginSettingTab {
	plugin: HashPlugin;

	constructor(app: App, plugin: HashPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Hash size')
			.setDesc('Number of bytes to generate.')
			.addText(text => text
				.setPlaceholder('Enter a whole number')
				.setValue(this.plugin.settings.size)
				.onChange(async (value) => {
					this.plugin.settings.size = value;
					await this.plugin.saveSettings();
				}));
	}
}
