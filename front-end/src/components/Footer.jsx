import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold mb-2">Local Guardian</h3>
          <p className="text-gray-400">Connecting you with trusted professionals for your service needs.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-yellow-400 transition-colors">Home</a></li>
            <li><a href="/services" className="hover:text-yellow-400 transition-colors">Services</a></li>
            <li><a href="/faq" className="hover:text-yellow-400 transition-colors">FAQs</a></li>
            <li><a href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-xl font-semibold mb-2">Contact Us</h4>
          <p className="text-gray-400">Email: support@localguardian.example</p>
          <p className="text-gray-400">Phone: +91-8767833212</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-blue-500 transition-colors"><FaFacebook size={24} /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><FaTwitter size={24} /></a>
            <a href="#" className="hover:text-pink-500 transition-colors"><FaInstagram size={24} /></a>
          </div>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-8 text-center py-4 text-gray-500">
        &copy; 2025 Local Guardian. All Rights Reserved.
      </div>
    </footer>
  )
}
