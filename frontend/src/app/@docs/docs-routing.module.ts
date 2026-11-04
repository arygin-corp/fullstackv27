import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './components/docs/faq/faq.component';
import { MatrixComponent } from './components/xlsx/matrix/matrix.component';
import { DomainsComponent } from './components/pdfs/domains/domains.component';
import { DataAccessRequestProcessFlowComponent } from './components/pdfs/data-access-request-process-flow/data-access-request-process-flow.component';
import { AmbassadorComponent } from './components/pdfs/ambassador/ambassador.component';
import { AccessGuideComponent } from './components/pdfs/access-guide/access-guide.component';
import { BusinessGlossaryTipsNotesComponent } from './components/pdfs/business-glossary-tips-notes/business-glossary-tips-notes.component';
import { DataIngestionComponent } from './components/pdfs/data-ingestion/data-ingestion.component';
import { DataQualityProcessComponent } from './components/pdfs/data-quality-process/data-quality-process.component';
import { MetadataProcessComponent } from './components/pdfs/metadata-process/metadata-process.component';
import { OnboardingComponent } from './components/pdfs/onboarding/onboarding.component';
import { RequestFlowComplexComponent } from './components/pdfs/request-flow-complex/request-flow-complex.component';
import { DMFlowComponent } from './components/pdfs/d-m-flow/d-m-flow.component';
import { DataSecurityProcessComponent } from './components/pdfs/data-security-process/data-security-process.component'; 
import { UserGuideComponent } from './components/pdfs/user-guide/user-guide.component';

const routes: Routes = [
  { path: '', redirectTo: 'user-guide', pathMatch: 'full' },
  { path: 'matrix', component: MatrixComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'access-guide', component: AccessGuideComponent },
  { path: 'ambassadors', component: AmbassadorComponent },
  { path: 'tips-and-notes', component: BusinessGlossaryTipsNotesComponent },
  { path: 'process-flow', component: DataAccessRequestProcessFlowComponent },
  { path: 'data-ingestion', component: DataIngestionComponent },
  { path: 'data-quality-process', component: DataQualityProcessComponent },
  { path: 'dm-flow', component: DMFlowComponent },
  { path: 'domains', component: DomainsComponent },
  { path: 'data-security-process', component: DataSecurityProcessComponent },
  { path: 'metadata-process', component: MetadataProcessComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'request-flow-complex', component: RequestFlowComplexComponent },
  { path: 'user-guide', component: UserGuideComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DocsRoutingModule { }