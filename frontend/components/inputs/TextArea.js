'use client';

export default function TextArea({
    value,
    onChange,
    placeholder,
    className = '',
    rows = 2,
    ...props
}) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full text-sm text-gray-500 border-b border-gray-200 
                focus:border-blue-500 hover:border-blue-500 focus:outline-none transition-colors resize-none ${className}`}
            {...props}
        />
    );
} 