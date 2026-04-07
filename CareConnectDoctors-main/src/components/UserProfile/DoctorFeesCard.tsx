type DoctorLike = {
  fee?: number;
  emergencyFee?: number;
};

export default function DoctorFeesCard({ doctor }: { doctor: DoctorLike | null }) {
  if (!doctor) return null;
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-gray-900/40">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Fees &amp; payments
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 bg-white/80 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Standard consultation
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            ₹{doctor.fee != null ? doctor.fee : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 p-4 bg-white/80 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Emergency / after hours
          </p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            ₹{doctor.emergencyFee != null ? doctor.emergencyFee : "—"}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Patients pay through CareConnect checkout (Razorpay / Stripe) after
        booking. Payouts depend on your clinic agreement.
      </p>
    </div>
  );
}
