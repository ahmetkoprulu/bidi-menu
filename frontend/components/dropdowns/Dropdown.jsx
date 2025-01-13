'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Dropdown({ trigger, items, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const buttonRect = dropdownRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const menuWidth = 192; // w-48 = 12rem = 192px

            // Position menu relative to button
            const top = buttonRect.bottom + window.scrollY + 8; // 8px gap
            let left = buttonRect.left + window.scrollX;

            // Check if menu would overflow on the right
            if (left + menuWidth > windowWidth) {
                left = buttonRect.right - menuWidth + window.scrollX;
            }

            setMenuPosition({ top, left });
        }
    }, [isOpen]);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleItemClick = (onClick) => {
        setIsOpen(false);
        onClick?.();
    };

    return (
        <>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                <div onClick={toggleDropdown}>
                    {trigger}
                </div>
            </div>
            {isOpen && typeof window !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'absolute',
                        top: menuPosition.top,
                        left: menuPosition.left,
                    }}
                    className="w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[999]"
                >
                    <div className="py-1" role="menu">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.onClick)}
                                className={`block w-full text-left px-4 py-2 text-sm ${item.className || 'text-gray-700 hover:bg-gray-100'}`}
                                role="menuitem"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
} 