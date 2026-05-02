import React, { useState } from "react";
import useLoginStore from "../../store/useLoginStore";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import countries from "../../utils/countries";
import avatars from "../../utils/avatars";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import useThemeStore from "../../store/useThemeStore";
const loginValidationSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^\d+$/, "phone number must be degits")
    .transform((value, originalValue) => {
      return originalValue.trim() === "" ? null : value;
    }),
  email: yup.string().nullable().notRequired().email("enter valid email").transform((value, originalValue) => {
    return originalValue.trim() === "" ? null : value
  })
}).test(
  "at-least-one",
  "Either email or mobile number required",
  function (value) {
    if (value)
      return !!(value.phoneNumber || value.email)
  }
);

const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, "otp must be 6 digits").required("otp is required")
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("username is required"),
  agreed: yup.bool().oneOf([true], "you msut agree to the terms")
})
const Login: React.FC = () => {
  const { step, setStep, setUserPhoneData, userPhoneData } =
    useLoginStore();
  const { theme, setTheme } = useThemeStore();

  // ❌ removed (handled by react-hook-form)
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // ❌ not used in UI
  // const [profilePicture, setProfilePicture] = useState(null);
  // const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  // ❌ duplicate (react-hook-form already handles errors)
  // const [error, setError] = useState("");

  const navigate = useNavigate();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: yupResolver(loginValidationSchema)
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue
  } = useForm({
    resolver: yupResolver(otpValidationSchema)
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(profileValidationSchema)
  });

  // 🎨 THEME CLASSES
  const isDark = theme === "dark";

  const bgMain = isDark ? "bg-[#111b21]" : "bg-[#d1d7db]";
  const cardBg = isDark ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]";
  const inputBg = isDark ? "bg-[#2a3942] text-[#d1d7db]" : "bg-[#f0f2f5] text-[#3b4a54]";
  const textSub = isDark ? "text-[#8696a0]" : "text-[#667781]";
  const btnColor = "bg-[#00a884] hover:bg-[#008f6f] text-white";

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden ${bgMain}`}>
      {/* WhatsApp Web style header background */}
      {!isDark && (
        <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0"></div>
      )}

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors shadow-sm ${isDark ? "bg-[#202c33] text-yellow-400 hover:bg-[#2a3942]" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          title="Toggle Theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className={`relative z-10 w-full max-w-md rounded-xl shadow-xl p-8 sm:p-10 ${cardBg}`}>
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center text-white text-3xl mb-5 shadow-sm">
            💬
          </div>
          <h1 className="text-2xl font-normal text-center">
            {step === 1 && "Log in to Chat-Adda"}
            {step === 2 && "Verify your number"}
            {step === 3 && "Profile info"}
          </h1>
          <p className={`text-sm mt-3 text-center leading-relaxed ${textSub}`}>
            {step === 1 && "Enter your phone number or email to get started."}
            {step === 2 && `Waiting to automatically detect an SMS sent to ${userPhoneData}.`}
            {step === 3 && "Please provide your name and an optional profile photo."}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleLoginSubmit((data) => {
            const userData = data.phoneNumber ?? data.email;
            if (userData) {
              setUserPhoneData(userData);
              setStep(2);
            }
          })}>

            <div className="flex flex-col gap-3 mb-2">
              <select
                value={selectedCountry.alpha2}
                onChange={(e) =>
                  setSelectedCountry(
                    countries.find(c => c.alpha2 === e.target.value)!
                  )
                }
                className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#00a884] transition-shadow cursor-pointer ${inputBg}`}
              >
                {countries.map((c) => (
                  <option key={c.alpha2} value={c.alpha2}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <div className={`px-4 py-3 rounded-lg flex items-center justify-center font-medium border border-transparent focus-within:border-[#00a884] ${inputBg}`}>
                  {selectedCountry.dialCode}
                </div>
                <input
                  {...loginRegister("phoneNumber")}
                  placeholder="Phone number"
                  className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#00a884] transition-shadow ${inputBg}`}
                />
              </div>
            </div>

            {loginErrors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1 mb-2 pl-1">
                {loginErrors.phoneNumber.message}
              </p>
            )}

            <div className="flex items-center my-5">
              <div className={`flex-grow border-t ${isDark ? 'border-[#2a3942]' : 'border-gray-200'}`}></div>
              <span className={`px-4 text-xs uppercase tracking-wider ${textSub}`}>or</span>
              <div className={`flex-grow border-t ${isDark ? 'border-[#2a3942]' : 'border-gray-200'}`}></div>
            </div>

            <input
              {...loginRegister("email")}
              placeholder="Email address"
              className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#00a884] transition-shadow ${inputBg}`}
            />

            {loginErrors.email && (
              <p className="text-red-500 text-xs mt-1 mb-2 pl-1">
                {loginErrors.email.message}
              </p>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 rounded-full font-medium transition-colors mt-8 shadow-sm ${btnColor}`}
            >
              Next
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit(() => setStep(3))}>

            <div className="flex justify-center gap-2 sm:gap-3 mb-8 mt-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^[0-9]?$/.test(value)) return;

                    const newOtp = [...otp];
                    newOtp[index] = value;
                    setOtp(newOtp);

                    setOtpValue("otp", newOtp.join(""));

                    if (value && index < 5) {
                      const nextSibling = document.querySelector(
                        `input[name="otp-${index + 1}"]`
                      ) as HTMLInputElement;
                      if (nextSibling) nextSibling.focus();
                    }
                  }}
                  name={`otp-${index}`}
                  className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-medium rounded-lg outline-none focus:ring-2 focus:ring-[#00a884] transition-shadow ${inputBg}`}
                />
              ))}
            </div>

            {otpErrors.otp && (
              <p className="text-red-500 text-sm mb-4 text-center">
                {otpErrors.otp.message}
              </p>
            )}

            <button className={`w-full py-3.5 rounded-full font-medium transition-colors mb-6 shadow-sm ${btnColor}`}>
              Verify
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`text-sm font-medium text-[#00a884] hover:underline`}
              >
                Wrong number?
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleProfileSubmit(() => { })}>

            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5 group cursor-pointer">
                <img
                  src={selectedAvatar}
                  className="w-28 h-28 rounded-full object-cover shadow-md"
                />
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-2xl">📷</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 flex-wrap px-2">
                {avatars.map((av, i) => (
                  <img
                    key={i}
                    src={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${selectedAvatar === av
                      ? "border-[#00a884]"
                      : "border-transparent"
                      }`}
                  />
                ))}
              </div>
            </div>

            <input
              {...profileRegister("username")}
              placeholder="Type your name here"
              className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#00a884] transition-shadow mb-1 ${inputBg}`}
            />

            {profileErrors.username && (
              <p className="text-red-500 text-xs mt-1 mb-2 pl-1">
                {profileErrors.username.message}
              </p>
            )}

            <label className={`flex items-center gap-3 text-sm mt-5 mb-2 cursor-pointer ${textSub}`}>
              <input type="checkbox" className="w-4 h-4 accent-[#00a884] rounded cursor-pointer" {...profileRegister("agreed")} />
              I agree to the Terms of Service
            </label>

            {profileErrors.agreed && (
              <p className="text-red-500 text-xs mt-1 mb-2 pl-1">
                {profileErrors.agreed.message}
              </p>
            )}

            <button className={`w-full py-3.5 rounded-full font-medium transition-colors mt-6 shadow-sm ${btnColor}`}>
              Save Profile
            </button>
          </form>
        )}

        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[#2a3942]' : 'border-gray-100'} flex items-center justify-center gap-2`}>
          <span className="text-[10px] text-[#8696a0]">🔒</span>
          <p className={`text-xs text-center ${textSub}`}>
            Your personal messages are end-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

