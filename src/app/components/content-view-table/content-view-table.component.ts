import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentList } from 'src/app/models/content-item-list.model';
import { ContentItem, ContentItemKind } from 'src/app/models/content-item.model';
import * as mime from 'mime'
import { ContentService } from 'src/app/services/content.service';



@Component({
  selector: 'app-content-view-table',
  templateUrl: './content-view-table.component.html',
  styleUrls: ['./content-view-table.component.scss']
})
export class ContentViewTableComponent implements OnInit {


  public mime = mime;
  public isOverviewOpen = false;
  public itemData: any;

  constructor(private contentService: ContentService) {
   }

  @Output() folderSelectedEvent = new EventEmitter<string>();
  @Output() itemDeletedEvent = new EventEmitter<boolean>();

  @Input() contentData!: ContentList;

  ngOnInit(): void {

  }

  public selectItem(item?: ContentItem) {
    if(item?.kind === ContentItemKind.Document) return;
    const newPath = (item?.path?.substring(1)+ '/' + item?.name+ '/');
    this.folderSelectedEvent.emit(newPath);
  }

  public downloadFile(item: ContentItem) {
    this.contentService.downloadDocument(item.path ?? '', item.name ?? '').subscribe((data) => {

      console.log(data);
      let dataType = data.type;
      let binaryData = [];
      binaryData.push(data);
      let downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      if (item.name)
        downloadLink.setAttribute('download', item.name);
      document.body.appendChild(downloadLink);
      downloadLink.click();
    });
  }

  public deleteItem(item: ContentItem) {
    // if item is folder delete document by id, else delete folder
    if(item.kind === ContentItemKind.Folder) {
      this.contentService.deleteFolderById(item.id ?? '').subscribe(() => {
        this.itemDeletedEvent.emit(true);
      });
    } else {
      this.contentService.deleteDocumentById(item.id ?? '').subscribe(() => {
        this.itemDeletedEvent.emit(true);
      });
    }


  }

  public openInfoDialog(item: ContentItem) {
    console.log('item', item);
    this.isOverviewOpen = true;
    this.itemData =  Object.entries(item);
    console.log(this.itemData);
  }

  public closeInfoDialog() {
    this.isOverviewOpen = false;
  }

  public getDocumentKindColor(mediaType: string) {
    let className = '';
    console.log(mime.getExtension(mediaType), mediaType);
    switch (mime.getExtension(mediaType)) {
      case 'pdf':
        className = 'red'
        break;
      case 'docx':
        className = 'blue'
        break;
      default:
        break;
    }
    return className;
  }

}
