
@isTest
public class ExpenseControllerTest {

    @testSetup
    public static void setupData() {
        Expense__c expenseOne = new Expense__c();
        expenseOne.Amount__c = 123;
        expenseOne.Category__c = 'Housing';
        expenseOne.Expense_Date__c = Date.today();
        expenseOne.Label__c = 'Test1';
        insert expenseOne;

        Expense__c expenseTwo = new Expense__c();
        expenseTwo.Amount__c = 30;
        expenseTwo.Category__c = 'Housing';
        expenseTwo.Expense_Date__c = Date.today();
        expenseTwo.Label__c = 'Test2';
        insert expenseTwo;

        Expense__c expenseThree = new Expense__c();
        expenseThree.Amount__c = 345;
        expenseThree.Category__c = 'Transportation';
        expenseThree.Expense_Date__c = Date.today();
        expenseThree.Label__c = 'Car';
        insert expenseThree;
    }

    @isTest 
    public static void getExpensesTest() {
        Test.startTest();
        List<Expense__c> expenseResult = ExpenseController.getExpenses('Test', 0, 10).expenseRecord;
        Integer amountResult = ExpenseController.getExpenses('Car', 1, 10).amountRecord;
        System.assertEquals(2, expenseResult.size());
        System.assertEquals(1, amountResult);
        Test.stopTest();  
    }
}