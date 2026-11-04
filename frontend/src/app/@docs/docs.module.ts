import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocsRoutingModule } from './docs-routing.module';
import { SharedModule } from '../@shared/shared.module';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DomainsComponent } from './components/pdfs/domains/domains.component';
import { FaqComponent } from './components/docs/faq/faq.component';
import { MatrixComponent } from './components/xlsx/matrix/matrix.component';
import { AmbassadorComponent } from './components/pdfs/ambassador/ambassador.component';
import { BusinessGlossaryTipsNotesComponent } from './components/pdfs/business-glossary-tips-notes/business-glossary-tips-notes.component';
import { DMFlowComponent } from './components/pdfs/d-m-flow/d-m-flow.component';
import { DataAccessRequestProcessFlowComponent } from './components/pdfs/data-access-request-process-flow/data-access-request-process-flow.component';
import { DataIngestionComponent } from './components/pdfs/data-ingestion/data-ingestion.component';
import { UserGuideComponent } from './components/pdfs/user-guide/user-guide.component';
import { RequestFlowComplexComponent } from './components/pdfs/request-flow-complex/request-flow-complex.component';
import { OnboardingComponent } from './components/pdfs/onboarding/onboarding.component';
import { MetadataProcessComponent } from './components/pdfs/metadata-process/metadata-process.component';
import { AccessGuideComponent } from './components/pdfs/access-guide/access-guide.component';
import { DataQualityPolicyComponent } from './components/pdfs/data-quality-policy/data-quality-policy.component';
import { DataQualityProcessComponent } from './components/pdfs/data-quality-process/data-quality-process.component';
import { MetadataPolicyComponent } from './components/pdfs/metadata-policy/metadata-policy.component';
import { ProductsComponent } from './components/json/products/products.component';
import { DataSecurityProcessComponent } from './components/pdfs/data-security-process/data-security-process.component';


@NgModule({
  declarations: [
    DomainsComponent,
    FaqComponent,
    MatrixComponent,
    AmbassadorComponent,
    BusinessGlossaryTipsNotesComponent,
    DMFlowComponent,
    DataAccessRequestProcessFlowComponent,
    DataIngestionComponent,
    UserGuideComponent,
    RequestFlowComplexComponent,
    OnboardingComponent,
    MetadataProcessComponent,
    AccessGuideComponent,
    DataQualityPolicyComponent,
    DataQualityProcessComponent,
    MetadataPolicyComponent,
    ProductsComponent,
    DataSecurityProcessComponent
  ],
  exports: [
    DomainsComponent,
    FaqComponent,
    MatrixComponent,
    AmbassadorComponent,
    BusinessGlossaryTipsNotesComponent,
    DMFlowComponent,
    DataAccessRequestProcessFlowComponent,
    DataIngestionComponent,
    UserGuideComponent,
    RequestFlowComplexComponent,
    OnboardingComponent,
    MetadataProcessComponent,
    AccessGuideComponent,
    DataQualityPolicyComponent,
    DataQualityProcessComponent,
    MetadataPolicyComponent,
    ProductsComponent
  ],
  imports: [
    CommonModule,
    DocsRoutingModule,
    SharedModule,
    NgxDocViewerModule
  ]
})
export class DocsModule { }
