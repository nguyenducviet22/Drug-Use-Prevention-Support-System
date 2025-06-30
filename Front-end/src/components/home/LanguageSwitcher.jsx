import React, { useState, useEffect } from 'react';
import './LanguageSwitcher.css'; // Import file CSS mới

function LanguageSwitcher({ currentLanguage, onChangeLanguage }) {
  // `selectedLanguage` sẽ là 'EN' hoặc 'VN' để điều khiển UI của switch
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage === 'en' ? 'EN' : 'VN');

  // Đồng bộ trạng thái nội bộ với prop currentLanguage
  useEffect(() => {
    setSelectedLanguage(currentLanguage === 'en' ? 'EN' : 'VN');
  }, [currentLanguage]);

  const handleToggle = () => {
    const newLangState = selectedLanguage === 'EN' ? 'VN' : 'EN';
    setSelectedLanguage(newLangState);
    // Gọi hàm onChangeLanguage từ props, truyền về 'en' hoặc 'vi' cho i18n
    onChangeLanguage(newLangState === 'EN' ? 'en' : 'vi');
  };

  // Xác định class cho vị trí cờ
  const thumbPositionClass = selectedLanguage === 'EN' ? 'en-active' : 'vn-active';

  // Xác định class cho hình ảnh cờ dựa trên ngôn ngữ i18n hiện tại (currentLanguage)
  const flagImageClass = currentLanguage === 'en' ? 'uk-flag' : 'vietnam-flag';


  return (
    <div className="language-switcher-container" onClick={handleToggle}>
      <span className={`language-switcher-text ${selectedLanguage === 'EN' ? 'active' : ''}`}>EN</span>
      <div className="language-switcher-track">
        <div className={`language-switcher-thumb ${thumbPositionClass} ${flagImageClass}`}></div>
      </div>
      <span className={`language-switcher-text ${selectedLanguage === 'VN' ? 'active' : ''}`}>VN</span>
    </div>
  );
}

export default LanguageSwitcher;