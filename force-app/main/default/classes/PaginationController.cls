public with sharing class PaginationController {

    @AuraEnabled(cacheable=true)
    public static Pagination fetchPaginationMetadata() {
        List<Pagination_Metadata__mdt> paginationList = [
            SELECT Amount_Records__c, Default__c 
            FROM Pagination_Metadata__mdt
            WITH SECURITY_ENFORCED 
            ORDER BY Amount_Records__c
        ];

        Decimal defaultAmount = 0;
        List<Decimal> amountRecordList = new List<Decimal>();
        for (Pagination_Metadata__mdt pm : paginationList) {
            amountRecordList.add(pm.Amount_Records__c);
            if (pm.Default__c) {
                defaultAmount = pm.Amount_Records__c;
            }
        }

        Pagination pagination = new Pagination();
        pagination.amountRecords = amountRecordList;
        pagination.defaultAmountRecord = defaultAmount;
        return pagination;
    }

    public class Pagination {
        @AuraEnabled
        public List<Decimal> amountRecords {get; set;}

        @AuraEnabled
        public Decimal defaultAmountRecord {get; set;}
    }
}