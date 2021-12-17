import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IFileUploadError, FileUploadErrorTypeEnum } from '../../models';

@Component({
  selector: 'tld-file-upload',
  templateUrl: './tld-file-upload.component.html',
  styleUrls: ['./tld-file-upload.component.scss']
})
export class TldFileUploadComponent {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('inputButton', { read: ElementRef }) inputButton: ElementRef;

  @Output() fileChange: EventEmitter<FileList> = new EventEmitter<FileList>();
  @Output() onError: EventEmitter<IFileUploadError> = new EventEmitter<IFileUploadError>();
  private _accept: string[] = [];
  @Input() set accept(val: string[]) {
    this._accept = val;
    this.allowedExtensions = val? val.join(","):"";
  };
  get accept() { return this._accept };
  @Input() maxSize: number;
  @Input() multiple = false;
  @Input() filePreviewProgress: number;
  @Input() allowEmpty: boolean;
  @Input() disabled: boolean;

  allowedExtensions: string;

  handleFileInput(event: any) {
    this.validate(event.target.files);
  }
  

  onFileDrop(files: FileList) {
    this.validate(files);
  }

  private emit(files: FileList) {
    if (files && files.length>0) {
      this.fileChange.emit(files);
    }
  }

  private emitError(error: IFileUploadError) {
    this.onError.emit(error);
  }

  private validate(files: FileList) {
    //let size = 0;
    const fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!this.allowEmpty && file.size == 0) {
        this.emitError({ code: FileUploadErrorTypeEnum.FILE_EMPTY, error: "File is empty", fileName: file.name });
        return;
      }
      fileNames.push(file.name);
      //size += file.size;
      if (!this.validExtension(file.name)) {
        this.emitError({ code: FileUploadErrorTypeEnum.UNSUPPORTED_EXTENSION, error: "Not valid extension.", fileName: file.name });
        return;
      }
      if (this.maxSize && file.size > this.maxSize) {
        this.emitError({ code: FileUploadErrorTypeEnum.MAX_SIZE, error: "Maximum allowed file size exceeded.", fileName: fileNames.join(", ") });
        return;
      }
    }



    this.emit(files);
    this.fileInput.nativeElement.value = '';
  }

  private validExtension(fileName: string) {
    return (
      this.accept.length == 0 ||
      (this.accept.length == 1 && this.accept[0] == '*') ||
      this.accept.includes(fileName.slice(fileName.lastIndexOf('.')).toLowerCase())
    );
  }

}
