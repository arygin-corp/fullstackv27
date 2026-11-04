import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-pages-media-post',
  templateUrl: './pages-media-post.component.html',
  styleUrls: ['./pages-media-post.component.scss']
})

export class PagesMediaPostComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoplayer: ElementRef;
  isPlay: boolean = false;
  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }
  jsonMedia: any;

  constructor(
    private httpClient: HttpClient
  ) { 

  }

  ngOnInit(): void {
    this.httpClient.get("assets/resources/json/media/media.json").subscribe(data =>{
      this.jsonMedia = data;
    })
  }

}
