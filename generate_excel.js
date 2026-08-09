import ExcelJS from 'exceljs';

async function createPremiumTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payments');

  // Define columns
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 35 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'SIP Plan', key: 'plan', width: 25 },
    { header: 'Date (YYYY-MM-DD)', key: 'date', width: 20 },
    { header: 'Receipt Link', key: 'receiptUrl', width: 45 },
    { header: 'Gold Booked (Premium)', key: 'goldBooked', width: 25 },
    { header: 'Amount Till Date (Basic)', key: 'amountTillDate', width: 25 }
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFD700' } }; // Gold text
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF171A13' } // Dark background
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data validation (Dropdown for SIP Plan)
  for (let i = 2; i <= 1000; i++) {
    worksheet.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Premium Flexible Bishi Plan,Basic 12M Plan"']
    };
    
    // Date validation for column E (triggers calendar in Google Sheets and some Excel versions)
    worksheet.getCell(`E${i}`).dataValidation = {
      type: 'date',
      operator: 'greaterThan',
      showErrorMessage: true,
      errorTitle: 'Invalid Date',
      error: 'Please enter a valid date in YYYY-MM-DD format.',
      allowBlank: true,
      formulae: [new Date('2020-01-01')]
    };
  }

  // Add sample rows
  worksheet.addRow({
    name: 'Milan Jain',
    email: 'milanjain1422@gmail.com',
    amount: 10000,
    plan: 'Premium Flexible Bishi Plan',
    date: new Date('2026-06-01'),
    receiptUrl: 'https://imgur.com/example_link',
    goldBooked: 1.25,
    amountTillDate: ''
  });
  
  worksheet.addRow({
    name: 'Jitu Jain',
    email: 'jitujain@live.in',
    amount: 5000,
    plan: 'Basic 12M Plan',
    date: new Date('2026-06-05'),
    receiptUrl: '',
    goldBooked: '',
    amountTillDate: 5000
  });

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell('C').numFmt = '₹#,##0.00'; // Format amount as currency
      row.getCell('E').numFmt = 'yyyy-mm-dd'; // Format date as YYYY-MM-DD
    }
  });

  // Save workbook
  await workbook.xlsx.writeFile('Aum_Jewellers_Premium_Payments.xlsx');
  console.log('Premium Excel template created: Aum_Jewellers_Premium_Payments.xlsx');
}

createPremiumTemplate().catch(console.error);
