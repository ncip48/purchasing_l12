import { VoucherType } from './voucher';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAIL';

export type TransactionType = {
    id: string;
    voucher_id: string;
    code: string;
    status: TransactionStatus;
    total: number;
    admin: number;
    voucher: VoucherType;
};
