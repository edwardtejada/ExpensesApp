import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ExpenseCreator extends LightningElement {
    objectApiName = 'Expense__c';

    @api expenseId;
    @api isModalOpen = false;

    closeModal() {
        this.isModalOpen = false;
    }

    handleSuccess() {
        this.notification(
            'Expense', 
            'Expense successfully saved', 
            'success');
        this.isModalOpen = false;
        this.launchEvent();
    }

    notification(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    handleCancel() {
        this.isModalOpen = false;
    }

    launchEvent() {
        const refreshExpenseEvent = new CustomEvent('refreshexpense');
        this.dispatchEvent(refreshExpenseEvent);
    }
}