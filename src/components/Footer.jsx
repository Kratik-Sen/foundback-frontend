import { Facebook, Github, Instagram, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-app py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Logo & Brand Column matching Image 1 */}
          <div className="md:col-span-1">
            <Brand />
          </div>

          {/* Site Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Site
            </h4>
            <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/browse/lost" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Lost
                </Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Report Lost
                </Link>
              </li>
              <li>
                <Link to="/browse/found" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Found
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Report Found
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Help
            </h4>
            <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Links
            </h4>
            <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Linkedin
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400">
                  YouTube
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-600 dark:hover:text-amber-400">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column matching Image 1 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Contact
            </h4>
            <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <p>Tel : +94 716520690</p>
              <p>Email : talkprojects@wrenix.com</p>
            </div>
            {/* Social Icons matching Image 1 */}
            <div className="mt-5 flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-amber-600" aria-label="Twitter">
                <Twitter size={15} />
              </a>
              <a href="#" className="hover:text-amber-600" aria-label="Facebook">
                <Facebook size={15} />
              </a>
              <a href="#" className="hover:text-amber-600" aria-label="Instagram">
                <Instagram size={15} />
              </a>
              <a href="#" className="hover:text-amber-600" aria-label="GitHub">
                <Github size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright notice matching Image 1 */}
        <div className="mt-12 border-t border-slate-200/80 pt-6 text-center text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400">
          © Copyright {new Date().getFullYear()} FoundBack. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
