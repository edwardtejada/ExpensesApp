
@isTest
public class PaginationControllerTest {
    @isTest 
    public static void fetchPaginationMetadataTest() {
        List<Pagination_Metadata__mdt> paginationList = [
            SELECT Amount_Records__c, Default__c 
            FROM Pagination_Metadata__mdt
        ];
        List<Decimal> paginationResult = PaginationController.fetchPaginationMetadata().amountRecords;

        System.assertEquals(paginationList.size(), paginationResult.size());
    }
}