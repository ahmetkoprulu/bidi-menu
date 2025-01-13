'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

export default function StepLayout({ steps, currentStep }) {
    return (
        <nav aria-label="Progress" className="mb-12">
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />

                {/* Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-500 ease-in-out"
                    style={{
                        width: `${(currentStep / (steps.length - 1)) * 100}%`
                    }}
                />

                {/* Steps */}
                <ol className="relative flex justify-between">
                    {steps.map((step, index) => (
                        <li key={step.id} className="flex flex-col items-center">
                            {/* Step Indicator */}
                            <div className="relative flex">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center 
                                        transition-all duration-300
                                        ${index <= currentStep
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border-2 border-gray-300 text-gray-400'
                                        }
                                    `}
                                >
                                    {index < currentStep ? (
                                        <CheckIcon className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>
                            </div>

                            {/* Label */}
                            <span
                                className={`
                                    mt-3 text-sm font-medium
                                    ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}
                                `}
                            >
                                {step.name}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
} 