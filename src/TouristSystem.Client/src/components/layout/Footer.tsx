import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Compass, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-100 border-t border-slate-900/60 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl group">
              <Compass className="h-6 w-6 text-blue-500 dark:text-sky-400 group-hover:rotate-45 transition-transform duration-500" />
              <span className="bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                TajikistanTravel
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              {t('footer.about', 'Discover the breathtaking landscapes, rich culture, and historical heritage of Tajikistan with us. Your journey of a lifetime awaits.')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/places" className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-light">
                  {t('navbar.places')}
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-light">
                  {t('navbar.hotels')}
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-light">
                  {t('navbar.restaurants')}
                </Link>
              </li>
              <li>
                <Link to="/transports" className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-light">
                  {t('navbar.transports')}
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-light">
                  {t('navbar.guides')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              {t('footer.contact', 'Contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-slate-400 font-light">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                <span>{t('footer.address', 'Rudaki Avenue, Dushanbe, Tajikistan')}</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-400 font-light">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span>+992 90 123 4567</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-400 font-light">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <span>info@tajikistantravel.tj</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              {t('footer.newsletter', 'Newsletter')}
            </h3>
            <p className="text-sm text-slate-400 mb-4 font-light leading-relaxed">
              {t('footer.newsletterSub', 'Subscribe to get the latest travel stories and special offers from Tajikistan.')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder={t('footer.newsletterPlaceholder', 'Your email address')}
                className="w-full bg-slate-900 border border-slate-800 rounded-l-full px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder-slate-500 font-light"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 rounded-r-full transition-all cursor-pointer"
              >
                {t('footer.join', 'Join')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Socials & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-500 font-light">
            &copy; {new Date().getFullYear()} TajikistanTravel. {t('common.copyright', 'All rights reserved.')}
          </p>
          <div className="flex space-x-5">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-pink-500 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-sky-400 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-red-500 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
