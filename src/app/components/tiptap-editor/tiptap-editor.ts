import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { SpellcheckerService } from '../../services/spellchecker.service';
import SpellcheckerExtension, {
  IProofreaderInterface,
  ITextWithPosition
} from '@farscrl/tiptap-extension-spellchecker';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-tiptap-editor',
  imports: [
    FormsModule,
    TiptapEditorDirective
  ],
  templateUrl: './tiptap-editor.html',
  styleUrl: './tiptap-editor.scss',
})
export class TiptapEditorComponent  implements OnInit, OnDestroy, IProofreaderInterface  {
  @Input() content = '';
  @Input() editable = true;

  editor?: Editor;

  constructor(private spellchecker: SpellcheckerService) {}

  ngOnInit(): void {
    // Initialize after view is rendered
    setTimeout(() => this.initializeEditor(), 0);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private initializeEditor(): void {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        SpellcheckerExtension.configure({
          proofreader: this,
          uiStrings: {
            noSuggestions: 'No suggestions',
          },
          onShowSuggestionsEvent: this.updateSuggestionBox.bind(this)
        }),
      ],
      editable: this.editable,
    });
  }

  // from IProofreaderInterface
  proofreadText(sentence: string): Promise<ITextWithPosition[]> {
    return this.spellchecker.proofreadText(sentence);
  }

  // IProofreaderInterface
  getSuggestions(word: string): Promise<string[]> {
    return this.spellchecker.getSuggestions(word);
  }

  // IProofreaderInterface
  normalizeTextForLanguage(text: string): string {
    return text.split('’').join("'");
  }

  onSpellcheckerUpdated(): void {
    console.log('Spellchecker has been updated in editor');
    if (this.editor){
      this.editor.commands.checkSpelling();
    }
  }

  private updateSuggestionBox(word: string) {
    const suggestionsBox = document.getElementById('suggestions-box');
    if (suggestionsBox) {
      // Apply Tailwind classes
      suggestionsBox.className = 'absolute bg-gray-100 border border-gray-300 rounded shadow-md p-2 z-50';

      // Style the ul element
      const ul = suggestionsBox.querySelector('ul');
      if (ul) {
        ul.className = 'list-none p-1 m-0 inline-block';
      }

      // Style individual suggestion items
      const listItems = suggestionsBox.querySelectorAll('li');
      listItems.forEach((li) => {
        li.className = 'cursor-pointer py-1 px-2 hover:text-green-500 transition-colors';

        // Remove the custom ::before content with arrow by clearing it
        // Since ::before is CSS, we'll use a data attribute instead
        li.setAttribute('data-has-arrow', 'true');
      });

      // Style the suggestion-link div
      const suggestionLink = suggestionsBox.querySelector('.suggestion-link');
      if (suggestionLink) {
        suggestionLink.className = 'mt-3 bg-green-500 hover:bg-green-600 text-white rounded-b p-2 flex flex-row items-center transition-colors cursor-pointer';
      }

      // Style the suggestion-text span
      const suggestionText = suggestionsBox.querySelector('.suggestion-text');
      if (suggestionText) {
        suggestionText.className = 'inline-block ml-1.5 max-w-xs text-white';
      }

      // adding focus to suggestions-box, to allow clicking in the box
      suggestionsBox.addEventListener('mouseover', () => {
        suggestionsBox.focus();
      });
    }
  }
}
