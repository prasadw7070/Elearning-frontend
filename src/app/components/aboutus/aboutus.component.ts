import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms'  
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Chapter } from 'src/app/models/chapter';
import { ProfessorService } from 'src/app/services/professor.service';
import * as $ from 'jquery';
import { Course } from 'src/app/models/course';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class aboutusComponent implements OnInit {

  chapter = new Chapter();
  coursenames : Observable<Course[]> | undefined;
     
  constructor(private _router : Router, private _service : ProfessorService) {}  
    
  ngOnInit() {

  }
}
