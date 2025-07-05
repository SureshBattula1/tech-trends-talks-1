import { Component, computed, inject, model, OnInit, signal, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxEditorComponent, Editor, Toolbar } from 'ngx-editor';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [SharedModule,  ],
  templateUrl: './blog-create.component.html',
  styleUrl: './blog-create.component.scss'
})
export class BlogCreateComponent implements OnInit {

  html = '';
  editor!: Editor;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currenttag = model('');
  readonly tags = signal(['Tech']);
  readonly alltags: string[] = ['Tech News', 'Mobiles','Loveß'];
  readonly filteredtags = computed(() => {
    const currenttag = this.currenttag().toLowerCase();
    return currenttag
      ? this.alltags.filter(tag => tag.toLowerCase().includes(currenttag))
      : this.alltags.slice();
  });

  readonly announcer = inject(LiveAnnouncer);

   toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
 

  constructor(private fb: FormBuilder) { }

  form: FormGroup = new FormGroup({});

  ngOnInit() {
    this.editor = new Editor();
    this.formInit();
  }

  formInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      subTitle: ['', [Validators.required]],
      decription: ['', [Validators.required]],
      content: ['', [Validators.required]],
      // image: ['', [Validators.required]],
      // content: ['', [Validators.required] ],
      tags: [this.tags]
    });
  }



  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.update(tags => [...tags, value]);
    }

    // Clear the input value
    this.currenttag.set('');
  }

  remove(tag: string): void {
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return tags;
      }

      tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
      return [...tags];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.update(tags => [...tags, event.option.viewValue]);
    this.currenttag.set('');
    event.option.deselect();
  }


  save(){
    console.log(`form data::`, this.form.value);
  }
   

}