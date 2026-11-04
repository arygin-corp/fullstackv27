import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { DataAccessRequestComponent } from './data-access-request.component';

const routes: Routes = [{ 
    path: '', component: DataAccessRequestComponent 
}];

@NgModule({ 
    declarations: [
        DataAccessRequestComponent
    ], 
    imports:[
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forChild(routes)
    ], 
    exports:[
        DataAccessRequestComponent
    ] 
})

export class DataAccessRequestModule {}
