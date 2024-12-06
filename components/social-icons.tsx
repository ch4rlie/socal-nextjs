interface SocialIconsProps {
  className?: string
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'footer'
}

export function SocialIcons({ 
  className = '',
  iconSize = 'md',
  variant = 'default'
}: SocialIconsProps) {
  const socialLinks = [
    {
      href: 'https://www.facebook.com/pages/SocalPrerunner/313391215390545',
      icon: 'fa-brands fa-facebook',
      label: 'Facebook',
      hoverColor: 'hover:text-[#1877F2]'
    },
    {
      href: 'https://instagram.com/socalprerunner/',
      icon: 'fa-brands fa-instagram',
      label: 'Instagram',
      hoverColor: 'hover:text-[#E4405F]'
    },
    {
      href: 'https://x.com/socalprerunner',
      icon: 'fa-brands fa-x-twitter',
      label: 'X (Twitter)',
      hoverColor: 'hover:text-black dark:hover:text-white'
    },
    {
      href: 'https://www.pinterest.com/socalprerunner/',
      icon: 'fa-brands fa-pinterest',
      label: 'Pinterest',
      hoverColor: 'hover:text-[#BD081C]'
    },
    {
      href: 'https://www.youtube.com/socalprerunnerlive',
      icon: 'fa-brands fa-youtube',
      label: 'YouTube',
      hoverColor: 'hover:text-[#FF0000]'
    }
  ]

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const variantClasses = {
    default: 'text-gray-600 dark:text-gray-400',
    footer: 'text-gray-300 dark:text-gray-500'
  }

  return (
    <div className={`flex items-center space-x-5 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            ${variantClasses[variant]}
            ${social.hoverColor}
            transition-colors duration-200
            transform hover:scale-110
          `}
          aria-label={social.label}
        >
          <i className={`${social.icon} ${sizeClasses[iconSize]}`} />
        </a>
      ))}
    </div>
  )
}
