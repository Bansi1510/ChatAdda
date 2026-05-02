import React, { useState } from "react";
import useLoginStore from "../../store/useLoginStore";

const Login: React.FC = () => {
  const {
    step,
    setStep,
    setUserPhoneData,
    userPhoneData,
    resetLoginState,
  } = useLoginStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Step 1 → Send OTP
  const handleSendOTP = () => {
    if (!phone) return alert("Enter mobile number");

    setUserPhoneData(phone);
    setStep(2);
  };

  // Step 2 → Verify OTP
  const handleVerifyOTP = () => {
    if (otp.length !== 6) return alert("Enter valid OTP");

    alert("Login successful 🚀");
    resetLoginState(); // or redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200">

      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-white/40">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl font-bold shadow-md">
            W
          </div>
          <h1 className="text-2xl font-semibold mt-3 text-gray-800">
            WhatsApp Clone
          </h1>
        </div>

        {/* STEP 1 → Phone Input */}
        {step === 1 && (
          <>
            <p className="text-gray-500 text-sm mb-4 text-center">
              Enter your phone number
            </p>

            <input
              type="text"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
            />

            <button
              onClick={handleSendOTP}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-medium transition"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 → OTP Input */}
        {step === 2 && (
          <>
            <p className="text-gray-500 text-sm mb-4 text-center">
              Enter OTP sent to <span className="font-semibold">{userPhoneData}</span>
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 mb-4 text-center tracking-widest"
            />

            <button
              onClick={handleVerifyOTP}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-medium transition mb-2"
            >
              Verify OTP
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-sm text-green-600 hover:underline"
            >
              Change number
            </button>
          </>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;