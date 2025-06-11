import React, { useState } from 'react';

// Main App component
const App = () => {
  // State to manage which main screen is currently visible
  const [currentScreen, setCurrentScreen] = useState('homeScreen');
  // State to track if the user is authenticated (logged in)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login screen states
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Banking operations states
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [accountName, setAccountName] = useState('');

  // Gemini API states
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);
  const [transactionInsight, setTransactionInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Define currency symbols mapping
  const currencySymbols = {
    USD: '$',
    KHR: '៛',
    LAK: '₭',
  };

  // Predefined wallet account data
  const walletAccounts = [
    { id: 'personalWallet', name: 'Personal Wallet', initialBalance: 2500.50, currency: 'USD' },
    { id: 'familyWallet', name: 'Family Wallet', initialBalance: 8000000, currency: 'KHR' },
    { id: 'travelWallet', name: 'Travel Wallet', initialBalance: 12000, currency: 'LAK' },
  ];

  // Hardcoded credentials for demonstration
  const validUsername = 'user';
  const validPin = '1234';

  // Function to handle login attempt
  const handleLogin = () => {
    if (username === validUsername && pin === validPin) {
      setLoginMessage('');
      setIsLoggedIn(true);
      setUsername('');
      setPin('');
    } else {
      setLoginMessage('Invalid username or PIN.');
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginMessage('');
    setUsername('');
    setPin('');
    setCurrentScreen('homeScreen');
    // Reset all account-specific data
    setBalance(0);
    setAccountName('');
    setSelectedCurrency('USD');
    setLastTransactionDetails(null);
    setTransactionInsight('');
    setMessage('');
  };

  // Function to handle wallet account selection
  const handleSelectWalletAccount = (account) => {
    setBalance(account.initialBalance);
    setSelectedCurrency(account.currency);
    setAccountName(account.name);
    setCurrentScreen('accountOverview');
    setMessage('');
    setDepositAmount('');
    setWithdrawAmount('');
    setLastTransactionDetails(null);
    setTransactionInsight('');
  };

  // Function to navigate to deposit screen
  const navigateToDeposit = () => {
    setCurrentScreen('depositScreen');
    setMessage('');
    setDepositAmount('');
    setTransactionInsight('');
  };

  // Function to navigate to withdraw screen
  const navigateToWithdraw = () => {
    setCurrentScreen('withdrawScreen');
    setMessage('');
    setWithdrawAmount('');
    setTransactionInsight('');
  };

  // Function to handle deposit action
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid positive deposit amount.');
      return;
    }
    setBalance(prevBalance => prevBalance + amount);
    setMessage(`Successfully deposited ${currencySymbols[selectedCurrency]}${amount.toFixed(2)} to ${accountName}.`);
    setLastTransactionDetails({ type: 'deposit', amount: amount });
    setTransactionInsight('');
    setCurrentScreen('accountOverview');
  };

  // Function to handle withdraw action
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid positive withdrawal amount.');
      return;
    }
    if (amount > balance) {
      setMessage('Insufficient funds.');
      return;
    }
    setBalance(prevBalance => prevBalance - amount);
    setMessage(`Successfully withdrew ${currencySymbols[selectedCurrency]}${amount.toFixed(2)} from ${accountName}.`);
    setLastTransactionDetails({ type: 'withdraw', amount: amount });
    setTransactionInsight('');
    setCurrentScreen('accountOverview');
  };

  // Function to get AI-powered transaction insight using Gemini API
  const handleGetTransactionInsight = async () => {
    setIsLoadingInsight(true);
    setTransactionInsight('');

    if (!lastTransactionDetails) {
      setTransactionInsight('Perform a transaction first to get an insight.');
      setIsLoadingInsight(false);
      return;
    }

    const prompt = `Given a ${lastTransactionDetails.type} of ${lastTransactionDetails.amount.toFixed(2)} ${selectedCurrency} on a ${accountName}, and the current balance is ${balance.toFixed(2)} ${selectedCurrency}, provide a brief, creative, and positive insight or suggestion. Keep it under 50 words.`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    
    // Note: In a real application, the API key should be stored securely on the backend
    const apiKey = "YOUR_GEMINI_API_KEY_HERE";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setTransactionInsight(text);
      } else {
        setTransactionInsight('Could not generate insight. Please try again.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setTransactionInsight('Failed to get insight. Please check your API key and network connection.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  // Render content based on the current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'homeScreen':
        return (
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md text-center">
            {!isLoggedIn ? (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
                  Login to Your Wallet
                </h1>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <input
                    type="password"
                    placeholder="PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  {loginMessage && (
                    <p className="text-red-500 text-sm mt-2">{loginMessage}</p>
                  )}
                  <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md mt-4"
                  >
                    Login
                  </button>
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Demo Credentials:</p>
                    <p className="text-sm text-gray-700 font-mono">Username: user</p>
                    <p className="text-sm text-gray-700 font-mono">PIN: 1234</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
                  Select Your Wallet Account
                </h1>
                <div className="space-y-3">
                  {walletAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleSelectWalletAccount(account)}
                      className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-lg">{account.name}</span>
                        <span className="text-sm opacity-90">
                          {currencySymbols[account.currency]}{account.initialBalance.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-6 w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-200 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        );

      case 'accountOverview':
        return (
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-4">
              Account Overview
            </h1>
            <p className="text-xl text-gray-600 font-medium text-center mb-6">
              Account: <span className="text-blue-600 font-semibold">{accountName}</span>
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg text-center mb-6 shadow-sm">
              <p className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
                Current Balance
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                {currencySymbols[selectedCurrency]}{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            {message && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6 shadow-sm" role="alert">
                <p className="font-medium text-center">{message}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={navigateToDeposit}
                className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
              >
                💰 Deposit
              </button>
              <button
                onClick={navigateToWithdraw}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
              >
                💸 Withdraw
              </button>
            </div>

            {lastTransactionDetails && (
              <div className="mt-6 p-5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm border border-indigo-100">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">💡 Transaction Insight</h2>
                {isLoadingInsight ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                    <p className="text-gray-600">Generating insight...</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleGetTransactionInsight}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md mb-4"
                    >
                      Get AI Insight ✨
                    </button>
                    {transactionInsight && (
                      <div className="bg-white p-4 rounded-md border border-indigo-200">
                        <p className="text-gray-700 text-center text-lg leading-relaxed">{transactionInsight}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setCurrentScreen('homeScreen')}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-200 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              ← Back to Wallet Selection
            </button>
          </div>
        );

      case 'depositScreen':
        return (
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-4">
              💰 Deposit Funds
            </h1>
            <p className="text-xl text-gray-600 font-medium text-center mb-6">
              Account: <span className="text-blue-600 font-semibold">{accountName}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center mb-6 shadow-sm">
              <p className="text-md sm:text-lg font-medium text-blue-800">
                Current Balance: {currencySymbols[selectedCurrency]}{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            {message && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6 shadow-sm" role="alert">
                <p className="font-medium text-center">{message}</p>
              </div>
            )}

            <div className="mb-6 p-5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm border border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">Enter Deposit Amount</h2>
              <input
                type="number"
                placeholder={`Amount in ${selectedCurrency}`}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleDeposit}
                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
              >
                Confirm Deposit
              </button>
            </div>
            
            <button
              onClick={() => setCurrentScreen('accountOverview')}
              className="w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-200 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        );

      case 'withdrawScreen':
        return (
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-4">
              💸 Withdraw Funds
            </h1>
            <p className="text-xl text-gray-600 font-medium text-center mb-6">
              Account: <span className="text-blue-600 font-semibold">{accountName}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center mb-6 shadow-sm">
              <p className="text-md sm:text-lg font-medium text-blue-800">
                Available Balance: {currencySymbols[selectedCurrency]}{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            {message && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6 shadow-sm" role="alert">
                <p className="font-medium text-center">{message}</p>
              </div>
            )}

            <div className="mb-6 p-5 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 shadow-sm border border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">Enter Withdrawal Amount</h2>
              <input
                type="number"
                placeholder={`Amount in ${selectedCurrency}`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                min="0"
                step="0.01"
                max={balance}
              />
              <button
                onClick={handleWithdraw}
                className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
              >
                Confirm Withdrawal
              </button>
            </div>
            
            <button
              onClick={() => setCurrentScreen('accountOverview')}
              className="w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-200 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;