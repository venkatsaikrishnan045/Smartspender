// Store expenses in localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const totalAmountEl = document.getElementById('totalAmount');
const categoryListEl = document.getElementById('categoryList');
const avgTransactionEl = document.getElementById('avgTransaction');
const highestExpenseEl = document.getElementById('highestExpense');
const totalTransactionsEl = document.getElementById('totalTransactions');
const transactionsListEl = document.getElementById('transactionsList');
const periodFilterEl = document.getElementById('periodFilter');

// Helper Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const saveExpenses = () => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
};

const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

const getCategoryTotal = (category) => {
    return expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
};

const getFilteredExpenses = () => {
    const period = periodFilterEl.value;
    if (period === 'all') return expenses;
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (period === 'month') {
            return expenseDate >= thirtyDaysAgo;
        }
        return expenseDate >= sevenDaysAgo;
    });
};

// UI Update Functions
const updateTotalAmount = () => {
    const total = calculateTotalExpenses();
    totalAmountEl.textContent = formatCurrency(total);
};

const updateCategoryList = () => {
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'other'];
    const total = calculateTotalExpenses();
    
    categoryListEl.innerHTML = categories.map(category => {
        const categoryTotal = getCategoryTotal(category);
        const percentage = total ? (categoryTotal / total) * 100 : 0;
        
        return `
            <div class="category-item">
                <span class="category-name">${capitalize(category)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-amount">${formatCurrency(categoryTotal)}</span>
            </div>
        `;
    }).join('');
};

const updateOverviewStats = () => {
    const total = calculateTotalExpenses();
    const count = expenses.length;
    const average = count ? total / count : 0;
    const highest = Math.max(...expenses.map(e => e.amount) || [0]);
    
    avgTransactionEl.textContent = formatCurrency(average);
    highestExpenseEl.textContent = formatCurrency(highest);
    totalTransactionsEl.textContent = count;
};

const updateTransactionsList = () => {
    const filteredExpenses = getFilteredExpenses();
    
    transactionsListEl.innerHTML = filteredExpenses.length ? filteredExpenses.map(expense => `
        <div class="transaction-item">
            <div class="transaction-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transaction-icon ${expense.amount > 50 ? 'high' : ''}">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m16 12-4 4-4-4M12 8v7"/>
                </svg>
                <div class="transaction-details">
                    <p>${expense.description}</p>
                    <p>${expense.date} • ${capitalize(expense.category)}</p>
                </div>
            </div>
            <div class="transaction-amount">
                <span>${formatCurrency(expense.amount)}</span>
                <button class="delete-btn" onclick="deleteExpense('${expense.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('') : '<p class="text-center">No expenses found for the selected period.</p>';
};

const updateUI = () => {
    updateTotalAmount();
    updateCategoryList();
    updateOverviewStats();
    updateTransactionsList();
};

// Event Handlers
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    
    const newExpense = {
        id: crypto.randomUUID(),
        description,
        amount,
        category,
        date: new Date().toISOString().split('T')[0]
    };
    
    expenses.unshift(newExpense);
    saveExpenses();
    updateUI();
    
    expenseForm.reset();
});

periodFilterEl.addEventListener('change', updateTransactionsList);

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    updateUI();
}

// Initial UI update
updateUI();