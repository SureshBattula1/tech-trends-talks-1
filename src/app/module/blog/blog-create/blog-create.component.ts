import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxEditorComponent, Editor, Toolbar } from 'ngx-editor';
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
      // image: ['', [Validators.required]],
      // content: ['', [Validators.required] ],
    });
  }

   

}