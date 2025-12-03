import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HunspellLoaderService } from './services/hunspell-loader.service';

interface Language {
  name: string;
  code: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'hunspell-validator';
  protected affContent = '';
  protected dicContent = '';
  protected textToValidate = '';

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
  protected showLanguageSelector = false;

  private hunspellLoader = inject(HunspellLoaderService);

  toggleLanguageSelector(): void {
    this.showLanguageSelector = !this.showLanguageSelector;
  }

  loadLanguage(): void {
    if (!this.selectedLanguage) {
      return;
    }

    this.isLoading = true;
    this.hunspellLoader.loadLanguage(this.selectedLanguage).subscribe({
      next: (result) => {
        this.affContent = result.aff;
        this.dicContent = result.dic;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load language files:', error);
        this.isLoading = false;
      }
    });
  }

  clearAll(): void {
    this.affContent = '';
    this.dicContent = '';
    this.textToValidate = '';
  }

  getLineCount(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }
}
