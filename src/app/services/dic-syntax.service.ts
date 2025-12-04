import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DicSyntaxService {
  registerDicLanguage(): void {
    const checkMonaco = setInterval(() => {
      const monaco = (window as any).monaco;
      if (monaco && monaco.languages) {
        clearInterval(checkMonaco);
        this.setupLanguage(monaco);
      }
    }, 100);

    setTimeout(() => clearInterval(checkMonaco), 5000);
  }

  private setupLanguage(monaco: any): void {
    const alreadyRegistered = monaco.languages
      .getLanguages()
      .some((l: any) => l.id === 'dic');

    if (alreadyRegistered) {
      return;
    }

    monaco.languages.register({ id: 'dic' });

    monaco.languages.setMonarchTokensProvider('dic', {
      defaultToken: '',
      tokenPostfix: '.dic',

      tokenizer: {
        root: [
          // Full-line comments
          [/^\s*#.*$/, 'comment'],

          // Header line: ONLY digits (+ optional whitespace and #comment)
          // e.g. "12345" or "12345   # entries"
          // Won't match "4-final/T" because of the "-".
          [/^\s*\d+\s*(#.*)?$/, 'number'],

          // Entry with slash flags:
          //   word/FLAGS <TAB> morph info / comment
          [
            /(^\s*)([^\/\s#][^\/\s\t]*)(\/)([^\s\t#]*)(\s*)(.*$)/,
            [
              'white',             // leading spaces
              'identifier.word',   // base word
              'delimiter',         // '/'
              'variable.flag',     // flags
              'white',
              'string.morph'       // morphology / rest of line
            ]
          ],

          // Entry without slash flags:
          //   word <TAB> morph info / comment
          [
            /(^\s*)([^#\s]+)(\s*)(.*$)/,
            [
              'white',
              'identifier.word',   // base word
              'white',
              'string.morph'       // morphology / rest
            ]
          ],

          // Quoted strings inside morph info
          [/"[^"]*"/, 'string'],

          // Numbers (inside morph info etc.)
          [/\b\d+\b/, 'number'],

          // Punctuation
          [/[;:,]/, 'delimiter'],

          // Whitespace
          [/\s+/, 'white'],

          // Fallback identifiers
          [/[A-Za-z_][\w-]*/, 'identifier'],
        ]
      }
    });

    monaco.languages.setLanguageConfiguration('dic', {
      comments: {
        lineComment: '#'
      }
    });

    monaco.editor.defineTheme('vs-light-dic', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'number', foreground: '098658' },
        { token: 'identifier.word', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'variable.flag', foreground: '795E26' },
        { token: 'string.morph', foreground: 'A31515' },
        { token: 'string', foreground: 'A31515' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'identifier', foreground: '001080' }
      ],
      colors: {}
    });
  }
}
