import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-monaco-editor',
  imports: [FormsModule, EditorComponent],
  templateUrl: './monaco-editor.html',
  styleUrl: './monaco-editor.scss',
})
export class MonacoEditor {
  @Input() content = '';
  @Input() editorOptions: any = {};
  @Input() title = '';

  @Output() contentChange = new EventEmitter<string>();

  onContentChange(value: string): void {
    this.content = value;
    this.contentChange.emit(value);
  }

  getLineCount(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }
}
