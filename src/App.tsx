import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, ArrowUpCircle, ArrowDownCircle, Trash2, PieChart, TrendingUp, Calendar } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      category
    };

    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryTotal = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getFilteredExpenses = () => {
    if (selectedPeriod === 'all') return expenses;
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (selectedPeriod === 'month') {
        return expenseDate >= thirtyDaysAgo;
      }
      return expenseDate >= sevenDaysAgo;
    });
  };

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'other'];
  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8" />
              <h1 className="text-2xl font-bold">SmartSpender</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">${totalExpenses.toFixed(2)}</span>
              <span className="text-sm opacity-75">Total Spent</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Add Expense Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="p-2 border rounded-md w-full"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                min="0"
                className="p-2 border rounded-md w-full"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border rounded-md w-full"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Expense</span>
            </button>
          </form>
        </div>

        {/* Spending Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Spending by Category</h2>
            </div>
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="capitalize">{cat}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600"
                        style={{
                          width: `${(getCategoryTotal(cat) / totalExpenses) * 100}%`
                        }}
                      />
                    </div>
                    <span className="font-medium">${getCategoryTotal(cat).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Spending Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Average per transaction</span>
                <span className="font-medium">
                  ${(totalExpenses / (expenses.length || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Highest expense</span>
                <span className="font-medium">
                  ${Math.max(...expenses.map(e => e.amount) || [0]).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total transactions</span>
                <span className="font-medium">{expenses.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {expense.amount > 50 ? (
                    <ArrowUpCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {expense.date} • {expense.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <p className="text-center text-gray-500 py-4">No expenses found for the selected period.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;