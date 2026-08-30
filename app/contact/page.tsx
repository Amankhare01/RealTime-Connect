"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  ArrowLeft,
  Clock,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.warn("Please complete all form fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/contact", {
        name,
        email,
        subject,
        message,
      });

      toast.success(res.data?.message || "Message sent successfully!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#0D1424] flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in-up">
        
        {/* Left Side: Information */}
        <div className="md:col-span-5 flex flex-col gap-6 pr-0 md:pr-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
            aria-label="Back to login"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-500/25 border border-white/10">
              C
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Get in Touch with <span className="text-blue-500">Connect</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Have a question, feedback, or need help with your account? Send us a message and our team will get back to you promptly.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#161D2F] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Fast Response</h3>
                <p className="text-gray-400 text-xs mt-0.5">We typically respond to inquiries within 24–48 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#161D2F] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Account & Technical Support</h3>
                <p className="text-gray-400 text-xs mt-0.5">Assistance with login, OTPs, messaging, or privacy settings.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-xs pt-2">
              <ShieldCheck size={16} />
              <span>We respect your privacy. Inquiries are handled confidentially.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form / Success Card */}
        <div className="md:col-span-7">
          <div className="bg-[#161D2F] p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative">
            
            {submitted ? (
              <div className="text-center py-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-lg">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-bold text-white">Message Delivered! 🎉</h2>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  Thank you for reaching out. We have sent a confirmation email to <strong className="text-blue-400">{email}</strong> and our team has been notified.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition text-sm"
                  >
                    Send Another Message
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-center text-sm shadow-lg shadow-blue-500/25 transition"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Send us a message ✉️</h2>
                <p className="text-gray-400 text-sm mb-6">Fill out the form below to reach our support team.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-300">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          aria-label="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-300">Your Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          aria-label="Your Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-300">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="What is this regarding?"
                      aria-label="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-300">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message or inquiry here..."
                      aria-label="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 mt-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg
                      ${loading
                        ? "bg-blue-600/50 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"}`}
                  >
                    <Send size={16} />
                    <span>{loading ? "Sending Message..." : "Send Message"}</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
