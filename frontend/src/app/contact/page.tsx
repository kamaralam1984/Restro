'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you can integrate with your backend API
      // await api.post('/contact', formData);
      
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        '123 Main Street',
        'City, State 12345',
        'India',
      ],
      color: 'bg-orange-600',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [
        '+1 (555) 123-4567',
        '+1 (555) 123-4568',
        'Mon-Sun: 9AM - 11PM',
      ],
      color: 'bg-blue-600',
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        'info@restroos.com',
        'support@restroos.com',
        'reservations@restroos.com',
      ],
      color: 'bg-green-600',
    },
    {
      icon: Clock,
      title: 'Opening Hours',
      details: [
        'Monday - Friday: 11AM - 10PM',
        'Saturday - Sunday: 10AM - 11PM',
        'Holidays: 12PM - 9PM',
      ],
      color: 'bg-purple-600',
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#', color: 'hover:bg-blue-600' },
    { icon: Instagram, name: 'Instagram', url: '#', color: 'hover:bg-pink-600' },
    { icon: Twitter, name: 'Twitter', url: '#', color: 'hover:bg-blue-400' },
    { icon: Linkedin, name: 'LinkedIn', url: '#', color: 'hover:bg-blue-700' },
    { icon: Youtube, name: 'YouTube', url: '#', color: 'hover:bg-red-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Get in <span className="text-orange-600">Touch</span>
            </h1>
            <p className="text-xl text-slate-300">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-600 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`w-12 h-12 ${info.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{info.title}</h3>
                  <ul className="space-y-2">
                    {info.details.map((detail, i) => (
                      <li key={i} className="text-slate-400 text-sm">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-3xl font-bold mb-6">Find Us</h2>
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133389012!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Why Contact Us?</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>Reserve a table for special occasions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>Inquire about catering services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>Provide feedback on your experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>Ask about our menu or ingredients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>Report any issues or concerns</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-12 bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Follow Us</h2>
            <p className="text-slate-400 mb-8">
              Stay connected with us on social media for the latest updates, special offers, and more!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    className={`w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center ${social.color} transition-colors border border-slate-700`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={social.name}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {[
              {
                question: 'Do you accept reservations?',
                answer: 'Yes, we accept reservations for both lunch and dinner. You can book a table online or call us directly.',
              },
              {
                question: 'Do you offer catering services?',
                answer: 'Yes, we provide catering services for events, parties, and corporate functions. Please contact us for more details.',
              },
              {
                question: 'What are your operating hours?',
                answer: 'We are open Monday-Friday from 11AM to 10PM, and Saturday-Sunday from 10AM to 11PM.',
              },
              {
                question: 'Do you have vegetarian options?',
                answer: 'Absolutely! We have a wide variety of vegetarian dishes. All vegetarian items are clearly marked on our menu.',
              },
              {
                question: 'Is parking available?',
                answer: 'Yes, we have complimentary parking available for our customers.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

