import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

interface HunspellFiles {
  aff: string;
  dic: string;
}

@Injectable({
  providedIn: 'root'
})
export class HunspellLoaderService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://www.spellchecker.pledarigrond.ch/hunspell';

  loadLanguage(languageCode: string): Observable<HunspellFiles> {
    const affUrl = `${this.baseUrl}/${languageCode}/${languageCode}.aff`;
    const dicUrl = `${this.baseUrl}/${languageCode}/${languageCode}.dic`;

    return forkJoin({
      aff: this.http.get(affUrl, { responseType: 'text' }),
      dic: this.http.get(dicUrl, { responseType: 'text' })
    });
  }
}
