import { Component, inject, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditor } from './components/monaco-editor/monaco-editor';
import { TiptapEditorComponent } from './components/tiptap-editor/tiptap-editor';
import { HunspellLoaderService } from './services/hunspell-loader.service';
import { SpellcheckerService } from './services/spellchecker.service';
import { AffSyntaxService } from './services/aff-syntax.service';
import { DicSyntaxService } from './services/dic-syntax.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

declare const window: any;

interface Language {
  name: string;
  code: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, MonacoEditor, TiptapEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnDestroy {
  protected title = 'hunspell-validator';
  protected affContent = '';
  protected dicContent = '';
  protected textToValidate = 'Ina casa ed ina cassa ed ina casssa ed ina chasa ed ina chassa ed ina chasssa.';

  protected languages: Language[] = [
    { name: 'Puter', code: 'rm-puter' },
    { name: 'Rumantsch Grischun', code: 'rm-rumgr' },
    { name: 'Surmiran', code: 'rm-surmiran' },
    { name: 'Sursilvan', code: 'rm-sursilv' },
    { name: 'Sutsilvan', code: 'rm-sutsilv' },
    { name: 'Vallader', code: 'rm-vallader' }
  ];

  protected selectedLanguage = '';
  protected isLoading = false;
  protected isRebuildingSpellchecker = false;
  protected showLanguageSelector = false;

  private affContentSubject = new Subject<string>();
  private dicContentSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  protected editorOptions = {
    theme: 'vs-light',
    language: 'text',
    automaticLayout: false,
    minimap: { enabled: false },
    lineNumbers: 'on',
    folding: true,
    scrollBeyondLastLine: false,
    readOnly: false,
  };

  protected affEditorOptions = {
    ...this.editorOptions,
    language: 'aff',
    theme: 'vs-light-aff'
  };

  protected dicEditorOptions = {
    ...this.editorOptions,
    language: 'dic',
    theme: 'vs-light-dic'
  };

  @ViewChild(TiptapEditorComponent) tiptapEditor?: TiptapEditorComponent;

  private hunspellLoader = inject(HunspellLoaderService);
  private spellchecker = inject(SpellcheckerService);
  private cdr = inject(ChangeDetectorRef);
  private affSyntax = inject(AffSyntaxService);
  private dicSyntax = inject(DicSyntaxService);

  constructor() {
    this.affSyntax.registerAffLanguage();
    this.dicSyntax.registerDicLanguage();

    // Set up debounced spell checker rebuilding when aff content changes
    this.affContentSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.rebuildSpellchecker());

    // Set up debounced spell checker rebuilding when dic content changes
    this.dicContentSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.rebuildSpellchecker());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleLanguageSelector(): void {
    this.showLanguageSelector = !this.showLanguageSelector;
  }

  // Track changes to aff content
  onAffContentChange(value: string): void {
    this.affContent = value;
    this.cdr.markForCheck();
    this.affContentSubject.next(value);
  }

  // Track changes to dic content
  onDicContentChange(value: string): void {
    this.dicContent = value;
    this.cdr.markForCheck();
    this.dicContentSubject.next(value);
  }

  loadLanguage(): void {
    if (!this.selectedLanguage) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    this.hunspellLoader.loadLanguage(this.selectedLanguage).subscribe({
      next: (result) => {
        this.affContent = result.aff;
        this.dicContent = result.dic;
        this.isLoading = false;
        this.cdr.markForCheck();
        this.initializeSpellchecker();
      },
      error: (error) => {
        console.error('Failed to load language files:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private rebuildSpellchecker(): void {
    this.isRebuildingSpellchecker = true;
    this.cdr.markForCheck();
    this.spellchecker.destroy();
    this.initializeSpellchecker();
  }

  private initializeSpellchecker(): void {
    if (!this.affContent || !this.dicContent) {
      this.isRebuildingSpellchecker = false;
      this.cdr.markForCheck();
      return;
    }

    this.spellchecker.initialize(this.affContent, this.dicContent).then(() => {
      this.isRebuildingSpellchecker = false;
      this.cdr.markForCheck();
      this.tiptapEditor?.onSpellcheckerUpdated();
      console.log('Spell checker initialized successfully');
    }).catch((error) => {
      this.isRebuildingSpellchecker = false;
      this.cdr.markForCheck();
      console.error('Failed to initialize spell checker:', error);
    });
  }

  getLineCount(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }
}
