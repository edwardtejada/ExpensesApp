public with sharing class ExpenseController {

    public static String getFilterParameter(String search) {
        String filter = '';
        if (String.isNotBlank(search)) {
            filter = 'WHERE Name LIKE \'%' + String.escapeSingleQuotes(search) + '%\' ' + 
                     'OR Category__c LIKE \'%' + String.escapeSingleQuotes(search) + '%\' ' + 
                     'OR Label__c LIKE \'%' + String.escapeSingleQuotes(search) + '%\' ';
        }
        return filter;
    }

    public static Integer amountExpenses(String search) {
        String filter = getFilterParameter(search);
        String queryString = 'SELECT COUNT() ' + 
                             'FROM Expense__c ' + 
                             filter +
                             'WITH SECURITY_ENFORCED ';
        return Database.countQuery(queryString);
    }
    
    @AuraEnabled(Cacheable=true)
    public static Expenses getExpenses(String search, Integer tableOffset, Integer tableSize) {
        String filter = getFilterParameter(search);
        String queryString = 'SELECT Id, Name, Amount__c, Category__c, Expense_Date__c, Label__c ' +
                             'FROM Expense__c ' + 
                             filter +
                             'WITH SECURITY_ENFORCED ' +
                             'LIMIT :tableSize ' +
                             'OFFSET :tableOffset ';
        List<Expense__c> expenseList = database.query(queryString);
        Expenses expense = new Expenses();
        expense.expenseRecord = expenseList;
        expense.amountRecord = amountExpenses(search);
        return expense;
    }

    public class Expenses {
        @AuraEnabled
        public List<Expense__c> expenseRecord {get; set;}

        @AuraEnabled
        public Integer amountRecord {get; set;}
    }
}