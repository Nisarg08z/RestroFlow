
const PRICE_PER_TABLE = 50;
const MIN_TABLES = 1;
const MAX_TABLES = 1000;

export const calculatePrice = (totalTables) => {
  if (!totalTables || totalTables < MIN_TABLES) {
    return 0;
  }
          
  const tables = Math.min(totalTables, MAX_TABLES);
  
  const monthlyPrice = tables * PRICE_PER_TABLE;
  
  return {
    totalTables: tables,
    pricePerTable: PRICE_PER_TABLE,
    monthlyPrice: monthlyPrice,
    annualPrice: Math.round(monthlyPrice * 12 * 0.9),
  };
};


