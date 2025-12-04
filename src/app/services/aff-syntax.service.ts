import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AffSyntaxService {
  registerAffLanguage(): void {
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
      .some((l: any) => l.id === 'aff');

    if (alreadyRegistered) {
      return;
    }

    monaco.languages.register({ id: 'aff' });

    monaco.languages.setMonarchTokensProvider('aff', {
      defaultToken: '',
      tokenPostfix: '.aff',

      tokenizer: {
        root: [
          // Comments
          [/#.*$/, 'comment'],

          // PFX / SFX header line: PFX A Y 3
          [
            /(^\s*)(PFX|SFX)(\s+)(\S+)(\s+)([YN])(\s+)(\d+)(.*$)/,
            [
              'white',              // leading spaces
              'keyword.directive',  // PFX / SFX
              'white',
              'variable.flag',      // flag
              'white',
              'keyword.modifier',   // Y / N
              'white',
              'number',             // count
              'string.condition'    // rest of line (comments etc.)
            ]
          ],

          // PFX / SFX rule line:
          // PFX A 0 re .
          // PFX A 0 re [^aeiou]
          [
            /(^\s*)(PFX|SFX)(\s+)(\S+)(\s+)(\S+)(\s+)(\S+)(\s*)(.*$)/,
            [
              'white',
              'keyword.directive',  // PFX / SFX
              'white',
              'variable.flag',      // flag
              'white',
              'string.affix',       // strip
              'white',
              'string.affix',       // add
              'white',
              'string.condition'    // condition / example / comment
            ]
          ],

          // Other known directives
          [
            /^\s*(SET|TRY|MAP|REP|LANG|TYPE|ICONV|OCONV|FORBIDDENWORD|CIRCUMFIX|KEEPCASE|FULLSTRIP|CHECKCOMPOUNDDUP|CHECKCOMPOUNDTRIPLE|SIMPLIFIEDTRIPLE|CHECKCOMPOUNDREP|CHECKCOMPOUNDCASE|CHECKCOMPOUNDPATTERN|CHECKPRODUCTIVITY|MAPTAB|BREAK|WORDCHARS|IGNORE|COMPLEXPREFIXES|ONLYINCOMPOUND|SPELLFILE|ALIAS|SYLLABLENUM)\b/,
            'keyword.directive'
          ],

          // Quoted strings
          [/"[^"]*"/, 'string'],

          // Numbers
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

    monaco.languages.setLanguageConfiguration('aff', {
      comments: {
        lineComment: '#'
      },
      brackets: [
        ['(', ')'],
        ['[', ']'],
        ['{', '}']
      ],
      autoClosingPairs: [
        { open: '"', close: '"' },
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' }
      ],
      surroundingPairs: [
        { open: '"', close: '"' },
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' }
      ]
    });

    // Folding + simple count validation
    monaco.languages.registerFoldingRangeProvider('aff', {
      provideFoldingRanges: (model: any, context: any, token: any) => {
        const ranges: any[] = [];
        const markers: any[] = [];

        const lineCount = model.getLineCount();
        const headerRegex = /^\s*(PFX|SFX)\s+(\S+)\s+\S+\s+(\d+)\b/;

        for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
          const lineText = model.getLineContent(lineNumber);
          const match = headerRegex.exec(lineText);
          if (!match) continue;

          const kind = match[1]; // PFX / SFX
          const flag = match[2];
          const declaredCount = parseInt(match[3], 10);
          const startLine = lineNumber;

          const endLine = Math.min(startLine + declaredCount, lineCount);
          if (endLine > startLine) {
            ranges.push({
              start: startLine,
              end: endLine,
              kind: monaco.languages.FoldingRangeKind.Region
            });
          }

          // Count actual rule lines for this flag
          let actualCount = 0;
          let current = startLine + 1;
          const ruleRegex = new RegExp(
            '^\\s*' + kind + '\\s+' + flag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'
          );

          while (current <= lineCount) {
            const text = model.getLineContent(current);
            if (ruleRegex.test(text)) {
              actualCount++;
              current++;
            } else {
              break;
            }
          }

          if (actualCount !== declaredCount) {
            markers.push({
              severity: monaco.MarkerSeverity.Warning,
              message: `Declared ${kind} count ${declaredCount} does not match actual rule lines ${actualCount}.`,
              startLineNumber: startLine,
              startColumn: 1,
              endLineNumber: startLine,
              endColumn: lineText.length + 1
            });
          }
        }

        if (monaco.editor) {
          monaco.editor.setModelMarkers(model, 'aff-validator', markers);
        }

        return ranges;
      }
    });

    monaco.editor.defineTheme('vs-light-aff', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'keyword.directive', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'variable.flag', foreground: '795E26' },
        { token: 'string', foreground: 'A31515' },
        { token: 'string.affix', foreground: 'A31515' },
        { token: 'string.condition', foreground: '2B91AF' },
        { token: 'number', foreground: '098658' },
        { token: 'identifier', foreground: '001080' }
      ],
      colors: {}
    });
  }
}
