import React, { useRef, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { Country } from "../utils/countries";
import useLoginStore from "../store/useLoginStore";
import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/useThemeStore";
import countries from "../utils/countries";
import avatars from "../utils/avatars";
import { sendOtpAPI, updateUserProfile, verifyOtpAPI } from "../services/user.service";
import Loader from "../utils/Loader";
import Spinner from "../utils/spinner";
import { useChatStore } from "../store/useChatStore";



/* ---------------- VALIDATION ---------------- */

const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .trim()
      .matches(/^\d{10}$/, { message: "Phone number must be exactly 10 digits", excludeEmptyString: true })
      .nullable()
      .notRequired(),

    email: yup
      .string()
      .trim()
      .email("Enter valid email")
      .nullable()
      .notRequired(),
  })
  .test(
    "one-required",
    "Either email or mobile number required",
    (value) => {
      return !!(value?.phoneNumber || value?.email);
    }
  );

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  agreed: yup.bool().oneOf([true], "You must agree to the terms"),
  about: yup.string().trim().max(30, "about must be less then 30 charactres")
});

/* ---------------- COMPONENT ---------------- */

const Login: React.FC = () => {
  const { step, setStep, setUserPhoneData } =
    useLoginStore();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();
  const { setCurrentUser } = useChatStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  // ✅ profile upload
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);


  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------------- FORMS ---------------- */

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
    mode: "onChange"
  });
  type loginData = yup.InferType<typeof loginValidationSchema>;
  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  });
  type otpType = yup.InferType<typeof otpValidationSchema>;
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });
  type profileType = yup.InferType<typeof profileValidationSchema>;
  /* ---------------- THEME ---------------- */

  const isDark = theme === "dark";

  const bgMain = isDark
    ? "bg-[#111b21]"
    : "bg-gradient-to-br from-[#e6fffa] via-white to-[#d1fae5]";

  const cardBg = isDark
    ? "bg-[#202c33] text-[#e9edef]"
    : "bg-white text-[#111b21]";

  const inputBg = isDark
    ? "bg-transparent border-b border-[#2a3942] text-[#d1d7db]"
    : "bg-transparent border-b border-gray-300 text-[#111b21]";

  const textSub = isDark ? "text-[#8696a0]" : "text-[#667781]";
  const btnColor = "bg-[#00a884] hover:bg-[#008f6f] text-white";

  /* ---------------- IMAGE HANDLER ---------------- */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!validTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG allowed");
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // ❌ block non-digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setOtpValue("otp", newOtp.join(""));

    // 👉 move forward
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };
  const onLoginSubmit = async (data: loginData) => {
    try {
      setIsSendingOtp(true);

      const { email, phoneNumber } = data;

      if (email) {
        const res = await sendOtpAPI({ email });

        if (res.status === "success") {
          toast.success(res.message);
          setUserPhoneData({ email });
          setStep(2);
        }
      } else if (phoneNumber) {
        const res = await sendOtpAPI({
          phoneNumber,
          phoneSuffix: selectedCountry.dialCode,
        });

        if (res.status === "success") {
          toast.success(res.message);
          setUserPhoneData({
            phoneNumber,
            phoneSuffix: selectedCountry.dialCode,
          });
          setStep(2);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onOtpSubmit = async (data: otpType) => {
    const { otp } = data;
    const userData = useLoginStore.getState();

    try {
      setIsVerifyingOtp(true)
      let res;
      if (userData.email) {
        res = await verifyOtpAPI({ email: userData.email, otp });
      } else if (userData.phoneNumber) {
        res = await verifyOtpAPI({ phoneNumber: userData.phoneNumber, phoneSuffix: userData.phoneSuffix ?? undefined, otp });
      }

      if (res.status == "success") {
        const user = res.data.user;
        if (user.username && user.profilePictures) {
          toast.success(`wellcome back in whatsapp`);
          setCurrentUser(user._id);
          setUser(user);
          navigate("/")
        }
        toast.success(res.message);
        setCurrentUser(user._id);

        setStep(3);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsVerifyingOtp(false);
    }

  }

  const onUpdateProfile = async (data: profileType) => {
    try {
      setIsSavingProfile(true);
      const { username, agreed, about } = data;

      const formData = new FormData();

      formData.append("username", username);
      formData.append("about", about ?? "");
      formData.append("agreed", String(agreed));

      if (profileFile) {
        formData.append("media", profileFile);
      } else {
        formData.append("profilePictures", selectedAvatar);
      }

      const res = await updateUserProfile(formData);

      if (res.status == "success") {
        toast.success(res.message);
        setStep(1);
        navigate("/");
      }

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSavingProfile(false);
    }
  }
  /* ---------------- UI ---------------- */

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden ${bgMain}`}
    >
      {isSendingOtp && <Loader text="Sending OTP..." />}
      {isVerifyingOtp && <Loader text="Verifying OTP..." />}
      {isSavingProfile && <Loader text="Saving profile..." />}
      {/* HEADER BG */}
      {!isDark && (
        <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0"></div>
      )}

      {/* THEME TOGGLE */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`w-10 h-10 rounded-full ${isDark
            ? "bg-[#202c33] text-yellow-400"
            : "bg-white text-gray-600"
            }`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div
        className={`relative z-10 w-full max-w-md rounded-xl shadow-xl p-8 sm:p-10 ${cardBg}`}
      >
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center text-white text-3xl mb-5">
            💬
          </div>

          <h1 className="text-2xl text-center">
            {step === 1 && "Log in to Chat-Adda"}
            {step === 2 && "Verify your number"}
            {step === 3 && "Profile info"}
          </h1>

          <p className={`text-sm mt-3 text-center ${textSub}`}>
            {step === 1 && "Enter your phone number or email."}
            {step === 2 && `OTP sent to you number`}
            {step === 3 && "Set your name and profile photo."}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <div className="flex flex-col gap-4 mb-4">
              <div className="relative w-full">
                {/* Selected */}
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className={`px-4 py-3 cursor-pointer flex justify-between items-center ${inputBg}`}
                >
                  <span>
                    {selectedCountry.flag} {selectedCountry.dialCode}
                  </span>
                  <span>▼</span>
                </div>

                {/* Dropdown list */}
                {isOpen && (
                  <div
                    className={`absolute top-full left-0 w-full max-h-48 overflow-y-auto shadow-lg z-50 border rounded-md ${isDark
                      ? "bg-[#202c33] border-[#2a3942]"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    {countries.map((c: Country) => (
                      <div
                        key={c.alpha2}
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer flex gap-2 ${isDark
                          ? "hover:bg-[#2a3942] text-[#e9edef]"
                          : "hover:bg-gray-100 text-black"
                          }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.dialCode}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                {...loginRegister("phoneNumber")}
                placeholder="Phone number"
                className={`w-full px-2 py-3 outline-none focus:border-[#00a884] ${inputBg}`}
              />

              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-xs">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="text-center text-xs my-4">OR</div>

            <input
              {...loginRegister("email")}
              placeholder="Email address"
              className={`w-full px-2 py-3 outline-none focus:border-[#00a884] ${inputBg}`}
            />

            {loginErrors.email && (
              <p className="text-red-500 text-xs">
                {loginErrors.email.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSendingOtp}
              className={`w-full py-3 rounded-full mt-6 flex items-center justify-center gap-2 ${btnColor} ${isSendingOtp ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isSendingOtp ? (
                <>
                  <Spinner size={20} />
                  Sending...
                </>
              ) : (
                "Next"
              )}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}

                  inputMode="numeric"
                  className={`w-10 h-12 text-center ${inputBg}`}
                />
              ))}
            </div>

            {otpErrors.otp && (
              <p className="text-red-500 text-sm text-center">
                {otpErrors.otp.message}
              </p>
            )}

            <button className={`w-full py-3 rounded-full ${btnColor}`}>
              Verify
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <img
                  src={profilePreview || selectedAvatar}
                  className="w-28 h-28 rounded-full object-cover"
                />

                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                  📷
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Avatar options */}
              <div className="flex gap-3 mt-4 flex-wrap justify-center">
                {avatars.map((av: string, i: number) => (
                  <img
                    key={i}
                    src={av}
                    onClick={() => {
                      setSelectedAvatar(av);
                      setProfilePreview(null);
                    }}
                    className={`w-12 h-12 rounded-full cursor-pointer border-2 transition ${selectedAvatar === av && !profilePreview
                      ? "border-green-500 scale-105"
                      : "border-transparent"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* USERNAME INPUT */}
            <div className="w-full mb-4">
              <label className={`text-sm ${textSub}`}>user name</label>

              <input
                {...profileRegister("username")}
                placeholder="Enter your name"
                className={`w-full px-0 py-2 bg-transparent outline-none border-b transition-all duration-200 ${isDark
                  ? "border-[#2a3942] text-[#d1d7db] focus:border-[#00a884]"
                  : "border-gray-300 text-[#111b21] focus:border-[#00a884]"
                  }`}
              />

              {profileErrors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.username.message}
                </p>
              )}
            </div>
            <div className="w-full mb-4">
              <label className={`text-sm ${textSub}`}>About</label>

              <input
                {...profileRegister("about")}
                placeholder="Say something about yourself"
                className={`w-full px-0 py-2 bg-transparent outline-none border-b transition-all duration-200 ${isDark
                  ? "border-[#2a3942] text-[#d1d7db] focus:border-[#00a884]"
                  : "border-gray-300 text-[#111b21] focus:border-[#00a884]"
                  }`}
              />

              {profileErrors.about && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.about.message}
                </p>
              )}
            </div>

            {/* TERMS CHECKBOX */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  {...profileRegister("agreed")}
                  className="accent-green-500"
                />
                Agree to Terms
              </label>

              {profileErrors.agreed && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.agreed.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSavingProfile}
              className={`w-full py-3 rounded-full flex items-center justify-center gap-2 ${btnColor} ${isSavingProfile ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isSavingProfile ? (
                <>
                  <Spinner size={20} />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;