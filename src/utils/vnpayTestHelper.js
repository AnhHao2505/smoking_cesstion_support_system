// Test helper to simulate VNPay callback
// URL format: /payment/callback?vnp_Amount=10000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP14354711&vnp_CardType=ATM&vnp_OrderInfo=Thanh+toan+don+hang%3A+123456&vnp_PayDate=20250713143000&vnp_ResponseCode=00&vnp_TmnCode=YOUR_TMN_CODE&vnp_TransactionNo=14354711&vnp_TransactionStatus=00&vnp_TxnRef=123456&vnp_SecureHash=HASH_VALUE

export const createTestVNPayCallbackUrl = (
  amount = 100000, // 100,000 VND
  responseCode = '00', // 00 = success, 01 = failed
  transactionRef = 'TEST_' + Date.now()
) => {
  const baseUrl = window.location.origin + '/payment/callback';
  const params = new URLSearchParams({
    vnp_Amount: (amount * 100).toString(), // VNPay expects amount in cents
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP' + Math.random().toString().slice(2, 10),
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Thanh toan Premium membership: ${transactionRef}`,
    vnp_PayDate: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
    vnp_ResponseCode: responseCode,
    vnp_TmnCode: 'TEST_TMN_CODE',
    vnp_TransactionNo: Math.random().toString().slice(2, 10),
    vnp_TransactionStatus: responseCode,
    vnp_TxnRef: transactionRef,
    vnp_SecureHash: 'TEST_HASH_' + Math.random().toString(36).slice(2)
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Test VNPay successful callback
export const testSuccessfulPayment = () => {
  const url = createTestVNPayCallbackUrl(100000, '00');
  console.log('Test successful payment URL:', url);
  window.open(url, '_blank');
};

// Test VNPay failed callback
export const testFailedPayment = () => {
  const url = createTestVNPayCallbackUrl(100000, '01');
  console.log('Test failed payment URL:', url);
  window.open(url, '_blank');
};

// Console helpers for development
if (process.env.NODE_ENV === 'development') {
  window.testVNPayCallback = {
    success: testSuccessfulPayment,
    failed: testFailedPayment,
    createUrl: createTestVNPayCallbackUrl
  };
  
  console.log('VNPay test helpers loaded. Use:');
  console.log('- window.testVNPayCallback.success() to test successful payment');
  console.log('- window.testVNPayCallback.failed() to test failed payment');
}
