import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component } from '@angular/core';

export interface DialogData {
  Message: string;
  success:boolean;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}

