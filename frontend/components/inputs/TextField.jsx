'use client';

export default function TextField({
    value,
    onChange,
    placeholder,
    className = '',
    textAlign = 'left',
    textSize = 'base',
    textWeight = 'normal',
    ...props
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`text-gray-600 border-b border-gray-200 hover:border-blue-500
                focus:border-blue-500 focus:outline-none transition-colors
                ${textAlign === 'right' ? 'text-right' : ''} text-${textSize} font-${textWeight} ${className}`}
            {...props}
        />
    );
} 