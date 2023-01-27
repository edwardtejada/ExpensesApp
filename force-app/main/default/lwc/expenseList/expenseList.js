import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getExpenses from '@salesforce/apex/ExpenseController.getExpenses';
import fetchPaginationMetadata from '@salesforce/apex/PaginationController.fetchPaginationMetadata';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    {label: 'Expense Name', fieldName: 'Name', type: 'text', sortable: "true"},
    {label: 'Expense Label', fieldName: 'Label__c', type: 'text', sortable: "true"},
    {label: 'Expense Date', fieldName: 'Expense_Date__c', type: 'date', sortable: "true"},
    {label: 'Category', fieldName: 'Category__c', type: 'text', sortable: "true"},
    {label: 'Amount', fieldName: 'Amount__c', type: 'currency', fixedWidth : 180, sortable: "false"},
    {
        fixedWidth : 120,
        label: 'Edit',
        type: "button-icon", 
        typeAttributes: {  
            name: 'Edit',  
            disabled: false,  
            title: 'Edit',
            variant: 'bare',
            alternativeText: 'Edit',
            iconName:'utility:edit',
            iconPosition: 'right'
        }
    }, 
    {
        fixedWidth : 120,
        label: 'Delete',
        type: "button-icon", 
        typeAttributes: {   
            name: 'Delete',  
            disabled: false,  
            title: 'Delete',
            variant: 'bare',
            alternativeText: 'Delete',
            iconName:'utility:delete',
            iconPosition: 'right'
        }
    },
]

export default class ExpenseList extends LightningElement {
    isLoading = true;
    page = 1;
    tableSize = 0;
    tableOffset = 0;
    countRecords = 0;
    disabledPrevious = true;
    disabledNext;
    defaultSize;
    search = '';
    _search = '';

    @track data = [];
    @track columns = COLUMNS;
    @track wiredExpenseList = [];
    @track options = [];

    get isThereRecordData() {
        return this.data.length > 0;
    }

    get tableSizeDisplay() {
        if (this.tableSize == 0) {
            return 'Table size';
        } else {
            return this.tableSize;
        }
    }

    get amountPages() {
        if (this.countRecords == 0) {
            return 1;
        } else {
            return Math.ceil(this.countRecords / this.tableSize); 
        }
    }

    @wire(fetchPaginationMetadata) 
    wireFetchPaginationMetadata({error, data}) { 
    	if (data) {
            this.defaultSize = data.defaultAmountRecord;
            data.amountRecords.forEach(element => {
                this.options.push({label: element, value: element});
            });
            this.handleDefaultSize();
        } else if (error) {
        	console.error(error);
        }
    }

    @wire(getExpenses, {search : '$search', tableOffset : '$tableOffset', tableSize : '$tableSize'})
    expenseList(result) {
        this.wiredExpenseList = result;
        if (result.data) {
            this.data = result.data.expenseRecord;
            this.countRecords = result.data.amountRecord;
            this.handleCheckNavigationButton();
            this.isLoading = false;
        } else if (result.error) {
            this.data = [];
            console.error(result.error);
        }
    }  

    handleNew() {
        this.template.querySelector('c-expense-creator').isModalOpen = true;
    }

    handleEdit(recordId) {
        this.template.querySelector('c-expense-creator').isModalOpen = true;
        this.template.querySelector('c-expense-creator').expenseId = recordId;
    }

    refreshExpenses() {
        refreshApex(this.wiredExpenseList);
    }

    handleRowAction({ detail }) {
        const { action, row } = detail;
        if (action.name === 'Delete') {
            this.deleteRecord(row.Id);
        }
        if (action.name === 'Edit') {
            this.handleEdit(row.Id);
        }
    }

    deleteRecord(recordId) {
        deleteRecord(recordId)
            .then(() => {
                this.notification(
                    'Expense', 
                    'Expense successfully deleted', 
                    'success');
                this.handleResetParameter();
            })
            .catch(error => {
                console.error(error);
                this.notification(
                    'Expense', 
                    'Error trying to delete expense', 
                    'error');
            })
    }

    notification(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    handleOnchange(event) {
        this._search = event.target.value;
    }

    handleEnter(event){
        if(event.keyCode === 13){
            this.handleResetParameter();
        }
    }

    handleSearch() {
        this.handleResetParameter();
    }

    handleResetParameter() {
        this.search = this._search;
        this.tableSize = this.defaultSize;
        this.tableOffset = 0;
        this.page = 1;
        this.refreshExpenses();
        if (this.tableSize >= this.countRecords) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextDisable');
        } else {
            this.hanldeChangeView('nextEnable');
            this.hanldeChangeView('previousDisable');
        }
    }

    handleCheckNavigationButton() {
        if (this.tableOffset === 0 && parseFloat(this.amountPages) > parseFloat(this.page)) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextEnable');
        } else if (this.tableOffset === 0 && parseFloat(this.amountPages) === 1  && parseFloat(this.page) === 1) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextDisable');
        }
    }

    hanldeChangeView(status) {
        if (status === 'previousDisable') {
            this.disabledPrevious = true;
        }
        if (status === 'previousEnable') {
            this.disabledPrevious = false;
        }
        if (status === 'nextDisable') {
            this.disabledNext = true;        
        }
        if (status === 'nextEnable') {
            this.disabledNext = false;
        }
    }

    handleDefaultSize() {
        this.tableSize = this.defaultSize;
        if (this.amountPages == this.page) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextDisable');
        }
    }

    handleSelectChange(event) {
        event.preventDefault();
        this.tableSize = Number(event.target.value);
        this.tableOffset = 0;
        this.page = 1;
        this.refreshExpenses();
        if (this.tableSize >= this.countRecords) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextDisable');
        } else {
            this.hanldeChangeView('nextEnable');
            this.hanldeChangeView('previousDisable');
        }
    }

    handlePrevious() {
        this.tableOffset -= this.tableSize;
        this.page--;
        this.refreshExpenses();
        if (this.tableOffset === 0) {
            this.hanldeChangeView('previousDisable');
            this.hanldeChangeView('nextEnable');
        } else {
            this.hanldeChangeView('nextEnable');
        }
    }

    handleNext() {
        this.tableOffset += this.tableSize;
        this.page++;
        this.refreshExpenses();
        if (this.tableOffset + this.tableSize >= this.countRecords) {
            this.hanldeChangeView('nextDisable');
            this.hanldeChangeView('previousEnable');
        } else {
            this.hanldeChangeView('previousEnable');
        }
    }

    handleFirst() {
        this.tableOffset = 0;
        this.page = 1;
        this.refreshExpenses();
        this.hanldeChangeView('previousDisable');
        this.hanldeChangeView('nextEnable');
    }

    handleLast() {
        let checkLastPage = this.countRecords - (this.countRecords)%(this.tableSize);
        if (checkLastPage != this.countRecords) { 
            this.tableOffset = checkLastPage;
        } else {
            this.tableOffset = this.countRecords - this.tableSize;
        }

        this.page = this.amountPages;
        this.refreshExpenses();
        if (this.page != 1) {
            this.hanldeChangeView('nextDisable');
            this.hanldeChangeView('previousEnable');
        }
    }
}