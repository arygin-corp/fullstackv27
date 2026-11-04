import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../../../@shared/services/cart.service';
import { environment } from '../../../../../environments/environment';
import { RootService } from '../../../../@shared/services/root.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppService } from '../../../../@shared/services/app.service';

@Component({
    selector: 'app-checkout',
    templateUrl: './page-checkout.component.html',
    styleUrls: ['./page-checkout.component.scss']
})

export class PageCheckoutComponent {
    isSubmitting = false;
    submissionStatus: 'idle' | 'fulfilling' | 'success' | 'error' = 'idle';

    constructor(
        public root: RootService,
        public cart: CartService,
        public appSvc: AppService,
        private http: HttpClient,
        public router: Router
    ) {}

    async executeCheckout() {
        this.cart.loadFromStorage();
        const state = await this.cart.state$.pipe(take(1)).toPromise();
        
        if (!state || (state.catalogItems.length === 0 && state.darRequests.length === 0)) {
            this.appSvc.notifyError?.("Your cart is empty.");
            return;
        }

        this.isSubmitting = true;
        try {
            this.submissionStatus = 'fulfilling';
            const snResult = await this.triggerServiceNowFulfillment(state);

            this.submissionStatus = 'success';
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Store the receipt data BEFORE clearing the cart
            const orderId = snResult?.result?.number || snResult?.number || 'REQ-SUCCESS';
            this.cart.setReceipt({
                id: orderId,
                items: [...state.catalogItems],
                darRequests: [...state.darRequests],
                date: new Date().toLocaleDateString(),
                total: 0 // As these are free requests
            });

            this.cart.clear();
            this.router.navigate(['/marketplace/order/cart/checkout/success'], { queryParams: { id: orderId } });
        } catch (error: any) {
            // ... error handling
        } finally {
            this.isSubmitting = false;
        }
    }

    private async triggerServiceNowFulfillment(state: any): Promise<any> {
        const headers = new HttpHeaders({
            'Authorization': `Basic ${environment.serviceNow.auth}`, 
            'Content-Type': 'application/json'
        });

        const payload = {
            sysparm_quantity: '1',
            variables: {
                v_dar_objectid_createdby: this.appSvc?.userData?.id,
                // Now both use the same mapping logic
                cart_items: state.catalogItems.map((item: any) => ({
                    formData: this.mapFormData(item.formData)
                })),
                dar_requests: state.darRequests.map((dar: any) => ({
                    formData: this.mapFormData(dar.formData)
                })),
            }
        };

        return this.http.post(environment.serviceNow.submitOrder, payload, { headers }).toPromise();
    }

    /**
     * Helper to ensure the formData sent to ServiceNow contains the exact schema required
     */
    private mapFormData(data: any): any {
        if (!data) return {};
        return {
            requesting_id: data.requesting_id,
            v_dar_objectid_createdby: data.v_dar_objectid_createdby,
            v_dar_objectid_reqfor: data.v_dar_objectid_reqfor,
            v_dar_workdayID_created_by: data.v_dar_workdayID_created_by,
            v_dar_workdayID: data.v_dar_workdayID,
            companyName: data.companyName,
            v_dar_organization: data.v_dar_organization,
            v_dar_platform: data.v_dar_platform,
            v_dar_dataDomainSelect: data.v_dar_dataDomainSelect,
            v_dar_userType: data.v_dar_userType,
            v_dar_accessType: data.v_dar_accessType,
            v_dar_environment: data.v_dar_environment,
            v_dar_accessReqClassification: data.v_dar_accessReqClassification,
            v_dar_accessStage: data.v_dar_accessStage,
            v_emd_PI_access: data.v_emd_PI_access,
            edm_PI_personal_details: data.edm_PI_personal_details,
            v_emd_specify_PII_needs: data.v_emd_specify_PII_needs,
            v_edm_type_of_work: data.v_edm_type_of_work,
            v_edm_3rd_party_vendor: data.v_edm_3rd_party_vendor,
            v_dat_api_name: data.v_dat_api_name,
            v_dar_select_a_data_warehouse_mart: data.v_dar_select_a_data_warehouse_mart,
            v_dar_bi_data_access_type: data.v_dar_bi_data_access_type,
            v_dar_gateway_if_other: data.v_dar_gateway_if_other,
            v_dar_gateway_database_schema: data.v_dar_gateway_database_schema,
            v_dar_post_database_schema: data.v_dar_post_database_schema,
            v_dar_post_table_names: data.v_dar_post_table_names,
            v_dar_tbdp_is_this_request_fort_irm_pricing: data.v_dar_tbdp_is_this_request_fort_irm_pricing,
            v_dar_select_an_oracle_access_type: data.v_dar_select_an_oracle_access_type,
            v_dar_oracle_other: data.v_dar_oracle_other,
            v_dar_OtherType: data.v_dar_OtherType,
            v_dar_mfr_other: data.v_dar_mfr_other,
            v_dar_mainframe_access_type: data.v_dar_mainframe_access_type,
            v_dar_mainframe_change_tso_id: data.v_dar_mainframe_change_tso_id,
            v_dare_mainframe_change_authorizers_vertical_horizontal: data.v_dare_mainframe_change_authorizers_vertical_horizontal,
            v_dar_mainframe_changeman_application: data.v_dar_mainframe_changeman_application,
            v_dar_mf_tso_id_removed: data.v_dar_mf_tso_id_removed,
            v_dar_mf_transaction: data.v_dar_mf_transaction,
            b_dar_mf_db2_plan_grant: data.b_dar_mf_db2_plan_grant,
            b_dar_mf_db2_plan_revoke: data.b_dar_mf_db2_plan_revoke,
            v_dar_mf_db2_plan_tso_id_or_job_name: data.v_dar_mf_db2_plan_tso_id_or_job_name,
            v_dar_mf_db2_plan_plan_name: data.v_dar_mf_db2_plan_plan_name,
            b_dar_mf_db2_plan_bind: data.b_dar_mf_db2_plan_bind,
            b_dar_mf_db2_plan_execute: data.b_dar_mf_db2_plan_execute,
            v_dar_mf_db2_table_name_s: data.v_dar_mf_db2_table_name_s,
            b_dar_mf_db2_select: data.b_dar_mf_db2_select,
            b_dar_mf_db2_update: data.b_dar_mf_db2_update,
            b_dar_mf_db2_insert: data.b_dar_mf_db2_insert,
            b_dar_mf_db2_delete: data.b_dar_mf_db2_delete,
            b_dar_mf_db2_grant: data.b_dar_mf_db2_grant,
            b_dar_mf_db2_revoke: data.b_dar_mf_db2_revoke,
            v_dar_mf_db2_tso_or_job_name: data.v_dar_mf_db2_tso_or_job_name,
            v_dar_mnfr_ims_option_type: data.v_dar_mnfr_ims_option_type,
            v_dar_mnfr_ims_options_select: data.v_dar_mnfr_ims_options_select,
            v_dar_mnfr_transaction_id: data.v_dar_mnfr_transaction_id,
            v_dar_mnfr_ims_transaction_group: data.v_dar_mnfr_ims_transaction_group,
            v_dar_mfrn_ims_transaction_group_description: data.v_dar_mfrn_ims_transaction_group_description,
            b_dar_ims_add: data.b_dar_ims_add,
            v_dar_mf_ims_tmna_region_area_code_for_adds: data.v_dar_mf_ims_tmna_region_area_code_for_adds,
            v_dar_mf_ims_transaction_group: data.v_dar_mf_ims_transaction_group,
            b_dar_ims_delete: data.b_dar_ims_delete,
            v_dar_mf_ims_ims_id_for_deletes: data.v_dar_mf_ims_ims_id_for_deletes,
            v_dat_data_access_type: data.v_dat_data_access_type,
            v_dar_DataReqDescription: data.v_dar_DataReqDescription,
            v_dar_businessJustification: data.v_dar_businessJustification,
            v_custom_control_group: data.v_custom_control_group,
            v_custom_routing_rule_identifier: data.v_custom_routing_rule_identifier,
            v_custom_fulfillment_group_1: data.v_custom_fulfillment_group_1,
            chk_dar_terms_message: data.chk_dar_terms_message,
            v_dar_dm_version: data.v_dar_dm_version
        };
    }
}