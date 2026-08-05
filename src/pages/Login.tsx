import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Mail,
  Lock,
  Phone,
  KeyRound,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  useAdminLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "@/api/hooks/auth.hooks";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<"admin" | "otp">("admin");

  // Admin credentials state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP credentials state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Mutations
  const adminLoginMutation = useAdminLoginMutation();
  const requestOtpMutation = useRequestOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await adminLoginMutation.mutateAsync({ email, password });
      login(result.token);
      toast({
        title: "Success",
        description: result.message || "Logged in successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await requestOtpMutation.mutateAsync({ phoneNumber });
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description:
          result.message ||
          `OTP sent successfully. ${result.data?.otp ? `Dev OTP: ${result.data.otp}` : ""}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description:
          error.message || "Please check your phone number and try again",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP code",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await verifyOtpMutation.mutateAsync({ phoneNumber, otp });
      login(result.token);
      toast({
        title: "Success",
        description: result.message || "Logged in successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive",
      });
    }
  };

  const isSubmitting =
    adminLoginMutation.isPending ||
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white p-4 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#E5D5B5] ring-4 ring-[#8A1B28]/40 shadow-2xl bg-[#0D261B] p-0.5 flex items-center justify-center transition-transform hover:scale-105">
              <img
                src="/logo.jpeg"
                alt="Sakhio Fine Jewellery Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold tracking-wider text-white">
              SAKHIO
            </h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#8A1B28] text-[#E5D5B5] border border-[#E5D5B5]/30">
              Admin
            </span>
          </div>
          <span className="text-xs font-bold text-[#E5D5B5] uppercase tracking-[0.25em]">
            Fine Jewellery
          </span>
          <p className="text-xs text-slate-400 mt-2">
            Store & Inventory Management Portal
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950/80 p-1 rounded-lg mb-6 border border-slate-800">
          <button
            onClick={() => {
              setLoginMethod("admin");
              setOtpSent(false);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginMethod === "admin"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Admin Credentials
          </button>
          <button
            onClick={() => setLoginMethod("otp")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginMethod === "otp"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Phone & OTP
          </button>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          {loginMethod === "admin" ? (
            <motion.form
              key="admin-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAdminLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-350">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-primary text-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-350">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-primary text-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-350">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-primary text-white"
                    disabled={otpSent || isSubmitting}
                  />
                </div>
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="otp" className="text-slate-350">
                    Enter OTP Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="otp"
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-slate-800 focus:border-primary text-white font-mono tracking-widest text-center"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-primary hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : otpSent ? (
                  <>
                    Verify OTP & Log In <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Send OTP Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
