import { Injectable } from '@angular/core';
import { Hunspell, HunspellFactory, loadModule } from 'hunspell-asm';
import { ITextWithPosition } from '@farscrl/tiptap-extension-spellchecker';
import { Tokenizer } from "@farscrl/rumantsch-language-tools";

@Injectable({
  providedIn: 'root'
})
export class SpellcheckerService {
  private hunspell: any = null;
  private isInitialized = false;
  private factory: any = null;

  async initialize(affContent: string, dicContent: string): Promise<void> {
    try {
      // Load Hunspell module
      this.factory = await loadModule();

      // Mount .aff file
      const affBuffer = new TextEncoder().encode(affContent);
      const affPath = await this.factory.mountBuffer(affBuffer, '.aff');

      // Mount .dic file
      const dicBuffer = new TextEncoder().encode(dicContent);
      const dicPath = await this.factory.mountBuffer(dicBuffer, '.dic');

      // Create hunspell instance with mounted file paths
      this.hunspell = this.factory.create(affPath, dicPath);
      this.isInitialized = true;

      console.log('Hunspell initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hunspell:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.hunspell !== null;
  }

  proofreadText(sentence: string): Promise<ITextWithPosition[]> {
    if (!this.isReady()) {
      return Promise.resolve([]);
    }

    const tokens = this.tokenizeString(sentence);
    const errors: ITextWithPosition[] = [];

    tokens.forEach((tkn) => {
      if (!this.hunspell!.spell(this.removeSpecialChars(tkn.word))) {
        errors.push(tkn);
      }
    });

    return Promise.resolve(errors);
  }

  getSuggestions(word: string): Promise<string[]> {
    return Promise.resolve(this.hunspell!.suggest(this.removeSpecialChars(word)));
  }

  destroy(): void {
    if (this.hunspell) {
      try {
        this.hunspell.dispose();
      } catch (error) {
        console.error('Error disposing Hunspell:', error);
      }
    }
    if (this.factory) {
      try {
        this.factory.unmount();
      } catch (error) {
        console.error('Error unmounting filesystem:', error);
      }
    }
    this.hunspell = null;
    this.factory = null;
    this.isInitialized = false;
  }

  private tokenizeString(text: string): ITextWithPosition[] {
    const tkns = Tokenizer.tokenize(text, false, false) as string[];
    const tokens: ITextWithPosition[] = [];

    let trimmedOffset = 0;

    tkns.forEach((tkn) => {
      if (this.isNumeric(tkn)) {
        return;
      }

      if (this.containsElementToIgnore(tkn)) {
        return;
      }

      const index = text.indexOf(tkn, trimmedOffset);
      tokens.push({
        offset: index,
        length: tkn.length,
        word: tkn,
      });
      trimmedOffset = index + tkn.length;
    });

    return tokens;
  }

  private isNumeric(str: string | undefined) {
    return !isNaN(Number(str));
  }

  private removeSpecialChars(text: string): string {
    // remove soft hyphen, zero-width space, thin space
    return text.replace(/[\u00AD\u200B\u2009]+/g, '');
  }

  public containsElementToIgnore(text: string): boolean {
    // check if email
    if (
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g.test(
        text,
      )
    ) {
      return true;
    }

    return false;
  }
}
