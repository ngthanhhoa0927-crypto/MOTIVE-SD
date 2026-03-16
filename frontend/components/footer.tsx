import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t mt-12 py-12 font-sans">
            <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-4 gap-8">
                {/* Cột 1 */}
                <div>
                    <h4 className="font-bold text-sm mb-4 text-gray-900">CUSTOMER SUPPORT</h4>
                    <ul className="text-xs text-gray-500 space-y-3">
                        <li><Link href="/help" className="hover:text-blue-600 transition">Help Center</Link></li>
                        <li><Link href="/buying-guide" className="hover:text-blue-600 transition">Buying Guide</Link></li>
                        <li><Link href="/return-policy" className="hover:text-blue-600 transition">Return Policy</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Cột 2 */}
                <div>
                    <h4 className="font-bold text-sm mb-4 text-gray-900">ABOUT MOTIVE SD</h4>
                    <ul className="text-xs text-gray-500 space-y-3">
                        <li><Link href="/about" className="hover:text-blue-600 transition">About Us</Link></li>
                        <li><Link href="/careers" className="hover:text-blue-600 transition">Careers</Link></li>
                        <li><Link href="/terms" className="hover:text-blue-600 transition">Terms</Link></li>
                        <li><Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Cột 3 & 4 */}
                <div className="col-span-2">
                    <h4 className="font-bold text-sm mb-4 text-gray-900">FOLLOW US</h4>
                    <div className="flex gap-3 mb-6">
                        <Link href="https://www.facebook.com/profile.php?id=61565790967524" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-600 hover:bg-blue-700 transition rounded-full text-white flex items-center justify-center">
                            <Facebook className="w-4 h-4 fill-white" />
                        </Link>
                        <Link href="https://www.instagram.com/2modshop/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 hover:opacity-90 transition rounded-full text-white flex items-center justify-center">
                            <Instagram className="w-4 h-4" />
                        </Link>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-3">
                        <li className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Plot No. 67, Tan Son Hamlet, Lien Son Commune, Phu Tho Province, Vietnam</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>098 450 2199</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>motivesd.vn@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-12 pt-8 border-t border-gray-100">
                © 2024 MotiveSD. All rights reserved.
            </div>
        </footer>
    );
}