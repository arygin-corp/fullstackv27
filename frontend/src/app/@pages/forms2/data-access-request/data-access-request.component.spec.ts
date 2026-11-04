import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DataAccessRequestComponent } from './data-access-request.component';
import { DataAccessRequestApiService } from './data-access-request-api.service';

describe('DataAccessRequestComponent', () => {
  let fixture: ComponentFixture<DataAccessRequestComponent>;
  const api = { getSchema: () => of({name:'DAR',sections:[{section_fields:[
    {key:'platform',label:'Platform',field_type:'select',required:true,options:[{value:'API',label:'API'}]},
    {key:'api_name',label:'API Name',field_type:'text',required:true,condition:{field:'platform',operator:'eq',value:'API'},clear_when_hidden:true},
    {key:'terms_accepted',label:'Accept terms',field_type:'checkbox',required:true}
  ]}]}), submit: jasmine.createSpy('submit').and.returnValue(of({message:'OK'})) };
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports:[ReactiveFormsModule,RouterTestingModule],declarations:[DataAccessRequestComponent],providers:[{provide:DataAccessRequestApiService,useValue:api}]}).compileComponents();
    fixture=TestBed.createComponent(DataAccessRequestComponent); fixture.detectChanges();
  });
  it('loads schema and enforces conditional requirements', () => {
    const c=fixture.componentInstance;
    expect(c.form.get('api_name')?.hasError('required')).toBeFalse();
    c.form.get('platform')?.setValue('API');
    expect(c.form.get('api_name')?.hasError('required')).toBeTrue();
  });
  it('requires true terms acceptance', () => {
    expect(fixture.componentInstance.form.get('terms_accepted')?.hasError('required')).toBeTrue();
  });
});
