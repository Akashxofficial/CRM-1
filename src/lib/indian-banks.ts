export interface BankItem {
  name: string;
  shortName: string;
  category: "PUBLIC" | "PRIVATE" | "HOME_LOAN" | "SMALL_FINANCE" | "FOREIGN" | "COOPERATIVE";
  popular?: boolean;
}

export const INDIAN_BANKS: BankItem[] = [
  // ── Popular / Top Private Banks ──
  { name: "HDFC Bank Ltd.", shortName: "HDFC Bank", category: "PRIVATE", popular: true },
  { name: "ICICI Bank Ltd.", shortName: "ICICI Bank", category: "PRIVATE", popular: true },
  { name: "Axis Bank Ltd.", shortName: "Axis Bank", category: "PRIVATE", popular: true },
  { name: "Kotak Mahindra Bank Ltd.", shortName: "Kotak Bank", category: "PRIVATE", popular: true },
  { name: "IndusInd Bank Ltd.", shortName: "IndusInd Bank", category: "PRIVATE", popular: true },
  { name: "State Bank of India", shortName: "SBI", category: "PUBLIC", popular: true },
  { name: "Punjab National Bank", shortName: "PNB", category: "PUBLIC", popular: true },
  { name: "Bank of Baroda", shortName: "Bank of Baroda", category: "PUBLIC", popular: true },
  { name: "Canara Bank", shortName: "Canara Bank", category: "PUBLIC", popular: true },
  { name: "Union Bank of India", shortName: "Union Bank", category: "PUBLIC", popular: true },
  { name: "Yes Bank Ltd.", shortName: "Yes Bank", category: "PRIVATE", popular: true },
  { name: "IDFC FIRST Bank Ltd.", shortName: "IDFC FIRST Bank", category: "PRIVATE", popular: true },
  { name: "Federal Bank Ltd.", shortName: "Federal Bank", category: "PRIVATE", popular: true },

  // ── Housing Finance & Home Loan Institutions ──
  { name: "LIC Housing Finance Ltd.", shortName: "LIC HFL", category: "HOME_LOAN", popular: true },
  { name: "Bajaj Housing Finance Ltd.", shortName: "Bajaj Housing", category: "HOME_LOAN", popular: true },
  { name: "Tata Capital Housing Finance Ltd.", shortName: "Tata Capital HFL", category: "HOME_LOAN", popular: true },
  { name: "PNB Housing Finance Ltd.", shortName: "PNB Housing", category: "HOME_LOAN", popular: true },
  { name: "HDFC Home Loans", shortName: "HDFC Home Loans", category: "HOME_LOAN", popular: true },
  { name: "SBI Home Finance", shortName: "SBI Home Loans", category: "HOME_LOAN", popular: true },
  { name: "ICICI Home Finance Co. Ltd.", shortName: "ICICI Home Finance", category: "HOME_LOAN" },
  { name: "Godrej Housing Finance Ltd.", shortName: "Godrej Housing", category: "HOME_LOAN" },
  { name: "Piramal Capital & Housing Finance", shortName: "Piramal HFL", category: "HOME_LOAN" },
  { name: "Can Fin Homes Ltd.", shortName: "Can Fin Homes", category: "HOME_LOAN" },
  { name: "GIC Housing Finance Ltd.", shortName: "GIC HFL", category: "HOME_LOAN" },
  { name: "IIFL Home Finance Ltd.", shortName: "IIFL Home Finance", category: "HOME_LOAN" },
  { name: "Aadhar Housing Finance Ltd.", shortName: "Aadhar Housing", category: "HOME_LOAN" },
  { name: "Home First Finance Company (HFFC)", shortName: "Home First", category: "HOME_LOAN" },
  { name: "Repco Home Finance Ltd.", shortName: "Repco Home", category: "HOME_LOAN" },
  { name: "Sundaram Home Finance Ltd.", shortName: "Sundaram Home", category: "HOME_LOAN" },
  { name: "Vastu Housing Finance Corporation", shortName: "Vastu Housing", category: "HOME_LOAN" },
  { name: "Shubham Housing Development Finance", shortName: "Shubham Housing", category: "HOME_LOAN" },

  // ── Other Public Sector Banks ──
  { name: "Bank of India", shortName: "BOI", category: "PUBLIC" },
  { name: "Indian Bank", shortName: "Indian Bank", category: "PUBLIC" },
  { name: "Central Bank of India", shortName: "Central Bank", category: "PUBLIC" },
  { name: "Indian Overseas Bank", shortName: "IOB", category: "PUBLIC" },
  { name: "UCO Bank", shortName: "UCO Bank", category: "PUBLIC" },
  { name: "Bank of Maharashtra", shortName: "Bank of Maharashtra", category: "PUBLIC" },
  { name: "Punjab & Sind Bank", shortName: "Punjab & Sind Bank", category: "PUBLIC" },

  // ── Other Private Sector Banks ──
  { name: "Bandhan Bank Ltd.", shortName: "Bandhan Bank", category: "PRIVATE" },
  { name: "South Indian Bank Ltd.", shortName: "South Indian Bank", category: "PRIVATE" },
  { name: "RBL Bank Ltd.", shortName: "RBL Bank", category: "PRIVATE" },
  { name: "City Union Bank Ltd.", shortName: "City Union Bank", category: "PRIVATE" },
  { name: "Karur Vysya Bank Ltd.", shortName: "KVB", category: "PRIVATE" },
  { name: "Tamilnad Mercantile Bank Ltd.", shortName: "TMB", category: "PRIVATE" },
  { name: "Jammu & Kashmir Bank Ltd.", shortName: "J&K Bank", category: "PRIVATE" },
  { name: "Karnataka Bank Ltd.", shortName: "Karnataka Bank", category: "PRIVATE" },
  { name: "DCB Bank Ltd.", shortName: "DCB Bank", category: "PRIVATE" },
  { name: "CSB Bank Ltd.", shortName: "CSB Bank", category: "PRIVATE" },
  { name: "Dhanlaxmi Bank Ltd.", shortName: "Dhanlaxmi Bank", category: "PRIVATE" },
  { name: "Nainital Bank Ltd.", shortName: "Nainital Bank", category: "PRIVATE" },

  // ── Small Finance & Payment Banks ──
  { name: "AU Small Finance Bank Ltd.", shortName: "AU Small Finance", category: "SMALL_FINANCE", popular: true },
  { name: "Equitas Small Finance Bank Ltd.", shortName: "Equitas SFB", category: "SMALL_FINANCE" },
  { name: "Ujjivan Small Finance Bank Ltd.", shortName: "Ujjivan SFB", category: "SMALL_FINANCE" },
  { name: "Jana Small Finance Bank Ltd.", shortName: "Jana SFB", category: "SMALL_FINANCE" },
  { name: "Capital Small Finance Bank Ltd.", shortName: "Capital SFB", category: "SMALL_FINANCE" },
  { name: "ESAF Small Finance Bank Ltd.", shortName: "ESAF SFB", category: "SMALL_FINANCE" },
  { name: "Suryoday Small Finance Bank Ltd.", shortName: "Suryoday SFB", category: "SMALL_FINANCE" },
  { name: "Utkarsh Small Finance Bank Ltd.", shortName: "Utkarsh SFB", category: "SMALL_FINANCE" },
  { name: "Shivalik Small Finance Bank Ltd.", shortName: "Shivalik SFB", category: "SMALL_FINANCE" },
  { name: "Unity Small Finance Bank Ltd.", shortName: "Unity SFB", category: "SMALL_FINANCE" },
  { name: "Airtel Payments Bank Ltd.", shortName: "Airtel Payments Bank", category: "SMALL_FINANCE" },
  { name: "Paytm Payments Bank Ltd.", shortName: "Paytm Payments Bank", category: "SMALL_FINANCE" },
  { name: "India Post Payments Bank (IPPB)", shortName: "IPPB", category: "SMALL_FINANCE" },
  { name: "Fino Payments Bank Ltd.", shortName: "Fino Payments Bank", category: "SMALL_FINANCE" },

  // ── Foreign Banks in India ──
  { name: "Standard Chartered Bank India", shortName: "Standard Chartered", category: "FOREIGN" },
  { name: "Citibank India", shortName: "Citibank", category: "FOREIGN" },
  { name: "HSBC India (Hongkong and Shanghai Banking Corp)", shortName: "HSBC India", category: "FOREIGN" },
  { name: "DBS Bank India Ltd.", shortName: "DBS Bank", category: "FOREIGN" },
  { name: "Barclays Bank PLC India", shortName: "Barclays", category: "FOREIGN" },
  { name: "Deutsche Bank AG India", shortName: "Deutsche Bank", category: "FOREIGN" },
  { name: "BNP Paribas India", shortName: "BNP Paribas", category: "FOREIGN" },
  { name: "SBM Bank (India) Ltd.", shortName: "SBM Bank", category: "FOREIGN" },

  // ── Major Co-operative & Rural Banks ──
  { name: "Saraswat Co-operative Bank Ltd.", shortName: "Saraswat Bank", category: "COOPERATIVE" },
  { name: "Cosmos Co-operative Bank Ltd.", shortName: "Cosmos Bank", category: "COOPERATIVE" },
  { name: "Bharat Co-operative Bank Ltd.", shortName: "Bharat Bank", category: "COOPERATIVE" },
  { name: "SVC Co-operative Bank Ltd. (Shamrao Vithal)", shortName: "SVC Bank", category: "COOPERATIVE" },
  { name: "TJSB Sahakari Bank Ltd.", shortName: "TJSB Bank", category: "COOPERATIVE" },
  { name: "Abhyudaya Co-operative Bank Ltd.", shortName: "Abhyudaya Bank", category: "COOPERATIVE" },
  { name: "NKGSB Co-operative Bank Ltd.", shortName: "NKGSB Bank", category: "COOPERATIVE" },
  { name: "Baroda UP Bank", shortName: "Baroda UP Bank", category: "COOPERATIVE" },
  { name: "Aryavart Bank", shortName: "Aryavart Bank", category: "COOPERATIVE" },
  { name: "Kerala Gramin Bank", shortName: "Kerala Gramin Bank", category: "COOPERATIVE" },
];

export const POPULAR_INDIAN_BANKS = INDIAN_BANKS.filter((b) => b.popular);

export function searchIndianBanks(query: string): BankItem[] {
  if (!query || !query.trim()) return INDIAN_BANKS;
  const q = query.trim().toLowerCase();
  return INDIAN_BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.shortName.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
  );
}
