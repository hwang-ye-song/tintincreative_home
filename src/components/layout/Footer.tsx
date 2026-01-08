import React from "react";
import { Link } from "react-router-dom";
import { Bot, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-base mb-3">
              <Bot className="h-5 w-5 text-accent" />
              <span>AI & 로봇공학 아카데미</span>
            </div>
            <p className="text-xs text-secondary-foreground/80">
              차세대 AI와 로봇공학 혁신가를 양성합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">빠른 링크</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/portfolio" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  포트폴리오
                </Link>
              </li>
              <li>
                <Link to="/faculty" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  강사진
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  로그인
                </Link>
              </li>
            </ul>
          </div>

          {/* Curriculum */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">커리큘럼</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/curriculum/basic" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  기초 트랙
                </Link>
              </li>
              <li>
                <Link to="/curriculum/application" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  응용 트랙
                </Link>
              </li>
              <li>
                <Link to="/curriculum/robot" onClick={handleLinkClick} className="hover:text-accent transition-colors">
                  로봇 트랙
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-medium text-sm mb-3">문의</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-accent" />
                <span>info@academy.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-accent" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-accent" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-xs text-secondary-foreground/60">
          <p>&copy; 2024 AI & 로봇공학 아카데미. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
