import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface BackendResponse {
  result: string;
}

@Component({
  selector: 'app-dnd',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dnd.component.html',
  styleUrls: ['./dnd.component.css'],
})
export class DndComponent {
  fileValid: boolean | null = null;
  fileUploaded: boolean = false;
  selectedFile: File | null = null;
  backendResponse: BackendResponse | null = null;

  private httpClient = inject(HttpClient);

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  onFileSelected(event: any) {
    console.log('File selected through normal input');
    const file: File = event.target.files[0];
    this.processFile(file);
  }

  onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Drag Over Event');
  }

  onDragLeave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Drag Leave Event');
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Drop Event');
    const file: File = event.dataTransfer.files[0];
    this.processFile(file);
  }

  private processFile(file: File) {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      this.fileValid = true;
      this.selectedFile = file;
      this.fileUploaded = true;
    } else {
      this.fileValid = false;
    }
  }

  sendFileToBackend() {
    if (this.selectedFile && this.fileValid) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.httpClient
        .post<BackendResponse>('http://localhost:8000/uploadfile/', formData)
        .subscribe({
          next: (response) => {
            console.log('Upload successful', response);
            this.backendResponse = response;
          },
          error: (error) => {
            console.error('Error during upload', error);
            this.backendResponse = {
              result: 'An error occurred: ' + error.message,
            };
          },
        });
    }
  }

  playAudio() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      const audioUrl = 'http://localhost:8000/audio/';
      this.audioPlayer.nativeElement.src = audioUrl;
      this.audioPlayer.nativeElement.load();
      this.audioPlayer.nativeElement.play().catch((error) => {
        console.error('Error playing audio', error);
      });
    }
  }
}
