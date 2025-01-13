'use client'

import React, { useState, useRef, useEffect } from 'react'

// interface Option {
//     value: string
//     label: string
// }

// interface IOSStyleSelectProps {
//     options: Option[]
//     onChange: (value: string) => void
//     initialSelectedIndex?: number
// }

export default function IOSStyleSelect({ options, onChange, initialSelectedIndex = 0 }) {
    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef(null)

    const itemHeight = 44 // Height of each option in pixels
    const visibleItems = 5 // Number of visible items

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = selectedIndex * itemHeight
        }
    }, [selectedIndex])

    const handleTouchStart = (e) => {
        setIsDragging(true)
        setStartY(e.touches[0].clientY)
        setScrollTop(containerRef.current?.scrollTop || 0)
    }

    const handleTouchMove = (e) => {
        if (!isDragging) return
        const deltaY = e.touches[0].clientY - startY
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollTop - deltaY
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        if (containerRef.current) {
            const newIndex = Math.round(containerRef.current.scrollTop / itemHeight)
            setSelectedIndex(newIndex)
            onChange(options[newIndex].value)
        }
    }

    return (
        <div className="relative w-64 h-48 overflow-hidden bg-white bg-opacity-50 backdrop-blur-md rounded-xl">
            <div
                ref={containerRef}
                className="absolute inset-0 overflow-auto scrollbar-hide"
                style={{
                    paddingTop: `${itemHeight * 2}px`,
                    paddingBottom: `${itemHeight * 2}px`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {options.map((option, index) => (
                    <div
                        key={option.value.id}
                        className={`h-11 flex items-center justify-center text-center text-black ${index === selectedIndex ? 'text-lg font-semibold' : 'text-base opacity-30'
                            }`}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
            <div className="absolute inset-x-0 top-1/2 h-11 -mt-5 pointer-events-none border-t border-b border-black border-opacity-10" />
        </div>
    )
}

