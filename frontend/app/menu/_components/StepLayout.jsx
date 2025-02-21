'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

export default function StepLayout({ steps, currentStep }) {
    return (
        <nav aria-label="Progress" className="mb-12">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => (
                    <li
                        key={step.id}
                        className={`flex items-center ${index !== steps.length - 1 ? 'w-full' : ''
                            }`}
                    >
                        {/* Step Circle */}
                        <div className="flex items-center justify-center relative">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    transition-all duration-300 border-2
                                    ${index <= currentStep
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }
                                `}
                            >
                                {index < currentStep ? (
                                    <CheckIcon className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`
                                    absolute -bottom-6 text-xs font-medium whitespace-nowrap
                                    ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}
                                `}
                            >
                                {step.name}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index !== steps.length - 1 && (
                            <div className="w-full flex items-center">
                                <div
                                    className={`
                                        h-0.5 w-full mx-4
                                        ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}
                                    `}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
} 