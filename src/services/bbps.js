import { bbpsFetchBill as clubBbpsFetchBill, bbpsPay as clubBbpsPay } from './clubapi.js';

export async function bbpsFetchBill({ provider, accountRef, billType }) {
  return await clubBbpsFetchBill({ provider, accountRef, billType });
}

export async function bbpsPay({ provider, accountRef, billType, amount, billNumber }) {
  return await clubBbpsPay({ provider, accountRef, billType, amount, billNumber });
}
