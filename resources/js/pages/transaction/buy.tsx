import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageProps } from '@/types';
import { VoucherType } from '@/types/voucher';
import { Head } from '@inertiajs/react';
import { Banknote, PlusCircle, QrCode, Receipt, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = PageProps<{
    vouchers: VoucherType[];
}>;

export default function VoucherPage({ vouchers }: Props) {
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);
    const adminFee = 1000;
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handleBuy = () => {
        if (!selectedVoucher) return;
        // Ganti ini dengan Inertia.post atau fetch ke backend jika sudah siap
        alert(`Membeli: ${selectedVoucher.name} dengan total Rp${selectedVoucher.price + adminFee}`);
    };

    useEffect(() => {
        if (selectedVoucher) {
            setSelectedMethod(null);
        }
    }, [selectedVoucher]);

    return (
        <>
            <Head title="Buy Voucher" />
            <div className="mx-auto max-w-3xl p-4">
                <h1 className="mb-4 text-2xl font-bold">Pilih Voucher WiFi</h1>

                {/* Looping Vouchers */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {vouchers.map((voucher) => (
                        <Card
                            key={voucher.id}
                            onClick={() => setSelectedVoucher(voucher)}
                            className={`cursor-pointer rounded-2xl border-2 shadow-md transition ${
                                selectedVoucher?.id === voucher.id ? 'border-success' : 'border-muted'
                            }`}
                        >
                            <CardHeader>
                                <CardTitle>{voucher.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-lg font-semibold text-green-600">Rp{voucher.price.toLocaleString()}</CardContent>
                        </Card>
                    ))}
                </div>

                {/* Harga + Admin */}
                {selectedVoucher && (
                    <div className="bg-muted border-muted mb-4 space-y-3 rounded-xl border p-4 shadow-md">
                        <div className="flex items-center gap-3">
                            <Wallet className="text-primary" />
                            <p className="text-lg">
                                <span className="font-medium">Harga Voucher:</span> Rp{selectedVoucher.price.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Receipt className="text-yellow-500" />
                            <p className="text-lg">
                                <span className="font-medium">Biaya Admin:</span> Rp{adminFee.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 border-t border-gray-300 pt-3">
                            <PlusCircle className="text-green-600" />
                            <p className="text-xl font-bold text-green-700">Total: Rp{(selectedVoucher.price + adminFee).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Metode Pembayaran */}
                {selectedVoucher && (
                    <div className="mb-6">
                        <h2 className="mb-2 text-lg font-semibold">Metode Pembayaran</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* QRIS */}
                            <div
                                onClick={() => setSelectedMethod('QRIS')}
                                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                    selectedMethod === 'QRIS' ? 'bg-muted border-success' : 'border-muted hover:border-success'
                                }`}
                            >
                                <QrCode className="text-success" />
                                <div>
                                    <p className="font-medium">QRIS</p>
                                    <p className="text-muted-foreground text-sm">Bayar pakai QRIS</p>
                                </div>
                            </div>

                            {/* Virtual Account (disabled) */}
                            <div className="flex cursor-not-allowed items-center gap-4 rounded-xl border bg-gray-100 p-4 opacity-50">
                                <Banknote className="text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-500">Virtual Account</p>
                                    <p className="text-sm text-gray-400">Belum tersedia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tombol Beli */}
                <Button disabled={!selectedVoucher || !selectedMethod} onClick={handleBuy} className="w-full">
                    Beli Sekarang
                </Button>
            </div>
        </>
    );
}
